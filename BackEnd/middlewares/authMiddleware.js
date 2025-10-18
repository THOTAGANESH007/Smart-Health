import jwt from "jsonwebtoken";
import User from "../models/User.js";

/*
protect → checks that the user is logged in (valid JWT in cookies).
authorize → checks that the user’s role is allowed to access that route.
*/

export async function protect(req, res, next) {
  try {
    const token =
      req.cookies.auth_token || req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ message: "Not authorized, Please Login!!!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password_hash");
    if (!user)
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });

    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Not authorized, invalid token", error: err.message });
  }
}

// Role-based authorization
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "User not found" });
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `User role '${req.user.role}' not allowed` });
    }
    next();
  };
}
