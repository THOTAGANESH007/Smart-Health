import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectVideo = async (token) => {
  if (!token) throw new Error("Not authorized, no token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId).select("-password_hash");

  if (!user) throw new Error("Not authorized, user not found");
  return user;
};
