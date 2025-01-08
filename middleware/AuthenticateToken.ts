import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
const User = require("../types/types");
import dotenv from "dotenv";
dotenv.config();

// Secret key (should be stored in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

declare global {
  namespace Express {
    interface Request {
      user?: typeof User;
    }
  }
}

// Middleware to verify the token
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");
  console.log("Auth header:", authHeader);
  console.log("JWT_SECRET length:", JWT_SECRET.length);

  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    console.log("No token found in request");
    res.status(403).json({ message: "Access denied, no token provided" });
    return;
  }

  try {
    console.log("Attempting to verify token");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
