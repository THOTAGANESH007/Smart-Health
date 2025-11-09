import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Receptionist from "../models/Receptionist.js";

// Regex for password strength validation
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.^#()\-_=+])[A-Za-z\d@$!%*?&.^#()\-_=+]{8,}$/;

// Signup
export async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create the base User record
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      phone,
    });

    // Step 2: Create corresponding profile and get its _id
    let profileId = null;

    switch (role) {
      case "PATIENT": {
        const patient = await Patient.create({
          userId: user._id,
          age: null,
          address: "",
          disease_details: "",
          blood_group: "",
        });
        profileId = patient._id;
        break;
      }

      case "DOCTOR": {
        const doctor = await Doctor.create({
          userId: user._id,
          specialization: "",
          experience_years: 1,
          contact_info: phone,
          consultation_type: "BOTH",
          availability_schedule: {},
          rating: 4,
          feedbackCount: 0,
          totalRating: 60,
        });
        profileId = doctor._id;
        break;
      }

      case "RECEPTIONIST": {
        const receptionist = await Receptionist.create({
          userId: user._id,
          contact_info: phone,
        });
        profileId = receptionist._id;
        break;
      }

      case "ADMIN":
        // no separate profile
        break;

      default:
        break;
    }

    // Step 3: Update User with the role-based profile _id
    if (profileId) {
      const updateField = role.toLowerCase() + "Id"; // e.g., doctorId, patientId, receptionistId
      await User.findByIdAndUpdate(user._id, { [updateField]: profileId });
    }

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Signin
export async function signin(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found!" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    // Store token in HTTP-only cookie
    res.cookie("auth_token", token, {
      httpOnly: true, // prevents JavaScript access
      sameSite: "Lax", // prevent CSRF partially
      secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
      maxAge: 7 * 60 * 60 * 1000, // 7 hours
    });

    // Prepare response object with role-based ID
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };

    // Attach role-based profile ID if exists
    if (user.role === "PATIENT" && user.patientId) {
      userResponse.patientId = user.patientId;
    } else if (user.role === "DOCTOR" && user.doctorId) {
      userResponse.doctorId = user.doctorId;
    } else if (user.role === "RECEPTIONIST" && user.receptionistId) {
      userResponse.receptionistId = user.receptionistId;
    }

    // Send response
    res.json({
      message: "Login successful",
      user: userResponse,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Signout
export async function signout(req, res) {
  try {
   // console.log("Before clearing:", req.cookies);

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // MUST match cookie path
    });

    //console.log("After clearing:", req.cookies);
    res.status(200).json({ message: "Signout successful" });
  } catch (err) {
    console.error("Signout error:", err);
    res.status(500).json({ error: err.message });
  }
}


//Forgot Password Controller
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const isPresent = await User.findOne({ email });
    if (!isPresent) {
      return res.status(400).json({
        message: "Email doesnot exist",
        error: true,
        success: false,
      });
    }
    const otp = generateOTP();
    const expireTime = new Date() + 60 * 60 * 1000; //1hr

    const update = await User.findByIdAndUpdate(isPresent._id, {
      forgot_password_otp: otp,
      forgot_password_expired: new Date(expireTime).toISOString(),
    });

    await sendEmail({
      to: email,
      subject: "Forgot password From Smart Health",
      html: forgotPasswordTemplate({
        name: isPresent.name,
        otp: otp,
      }),
    });
    return res.json({
      message: "Check Your Email",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//Verify the otp
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required field email or otp",
        error: true,
        success: false,
      });
    }

    const isPresent = await User.findOne({ email });
    if (!isPresent) {
      return res.status(400).json({
        message: "Email doesnot exist",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (isPresent.forgot_password_expired < currentTime) {
      return res.status(400).json({
        message: "Otp is Expired",
        error: true,
        success: false,
      });
    }

    if (otp !== isPresent.forgot_password_otp) {
      return res.status(400).json({
        message: "Invalid Otp",
        error: true,
        success: false,
      });
    }

    //if otp isnot expired and matches db otp
    return res.json({
      message: "Verification of otp is done",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true,
    });
  }
}

//Reset Password Controller
export async function resetForgotPassword(req, res) {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Provide required fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not available",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "new Password & confirm Password not matched",
        error: true,
        success: false,
      });
    }

    // Validate password strength before hashing
    if (!passwordRegex.test(newPassword)) {
      //test is a predefined function in javascript to check regex pattern
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);

    const update = await User.findOneAndUpdate(user._id, {
      password_hash: hashPassword,
    });

    return res.json({
      message: "Password Updated Successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

//Upload Profile Image Controller
export async function uploadProfile(req, res) {
  try {
    const userId = req.user._id; //from protect middleware
    const image = req.file; //from multer middleware
    if (!image) {
      return res
        .status(400)
        .json({ message: "No file uploaded", error: true, success: false });
    }

    const upload = await uploadImageCloudinary(image);
    const updateUser = await User.findByIdAndUpdate(userId, {
      profile: upload.url,
    });
    return res.json({
      message: "Uploaded Profile",
      data: {
        _id: userId,
        profile: upload.url,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message, error: true, success: false });
  }
}

//update User Details Controller
export async function updateUserDetails(req, res) {
  try {
    const userId = req.user._id; //from protect middleware
    const { name, password, phone } = req.body;

    let hashPassword = "";
    if (password) {
      // Validate password strength before hashing
      if (!passwordRegex.test(password)) {
        //test is a predefined function in javascript to check regex pattern
        return res.status(400).json({
          message:
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
        });
      }
      hashPassword = await bcrypt.hash(password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name: name }),
        ...(phone && { phone: phone }),
        ...(password && { password_hash: hashPassword }),
      },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "User Details Updated",
      success: true,
      error: false,
      data: {
        name: updateUser.name,
        profile: updateUser.profile,
        phone: updateUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}

export async function saveFCMtoken(req, res) {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken)
      return res.status(400).json({ message: "No token provided" });

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: "FCM token saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error saving token", error: err.message });
  }
}
