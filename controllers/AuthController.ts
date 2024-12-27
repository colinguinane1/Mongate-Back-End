import { Request, response, Response } from "express";
import User from "../models/UserModel";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined");
}

const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addProfileView = async (req: Request, res: Response): Promise<void> => {
  const user = req.body.user;
  if (!user) {
    res
      .status(400)
      .json({ message: "No user logged in. Not adding profile view." });
    return;
  }
  try {
    const username = req.params.username;
    const profile = await User.findOne({ username }).select("-password");

    if (!profile) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    profile.profile_views++;
    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { userId, username } = req.body;
  try {
    if (!userId || !username) {
      res.status(400).json({ message: "Missing Data" });
      return;
    }
    if (username.length < 4) {
      res
        .status(400)
        .json({ message: "Username must be at least 4 characters long" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }
    user.username = username;
    await user.save();
    res.status(200).json({ user, message: "User updated successfully" });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Error:", error });
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Received registration request:", { email, password });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User exists:", email);
      res.status(400).json({ message: "User exists" });
      return;
    }

    const name = email.split("@")[0];

    const username = name + Math.floor(Math.random() * 9999) + 1;


    const user = new User({
      email,
      password,
      username,
      current_number_data: new Map(),
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Received login request:", { email });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log("Returning token.");
    res.status(201).json({ token, user });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export {
  getUser,
  registerUser,
  getProfile,
  addProfileView,
  updateUser,
  getAllUsers,
  loginUser,
};
