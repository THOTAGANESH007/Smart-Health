import jwt from "jsonwebtoken";
import User from "../models/User.js"; // or Patient/Doctor model depending on your schema

export const protectVideo = async (token) => {
  try {
    // If token includes "Bearer " prefix
    if (token.startsWith("Bearer ")) token = token.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =
      (await User.findById(decoded.id).select("-password")) ||
      (await Doctor.findById(decoded.id).select("-password")) ||
      (await Patient.findById(decoded.id).select("-password"));

    if (!user) throw new Error("User not found");

    return user;
  } catch (err) {
    console.error("protectVideo error:", err.message);
    throw new Error("Invalid or expired token");
  }
};
