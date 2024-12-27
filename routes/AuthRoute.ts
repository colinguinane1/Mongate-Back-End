import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  getProfile,
  addProfileView,
  getAllUsers,
  updateUser,
} from "../controllers/AuthController";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/user", authenticateToken, getUser);
router.get("/all-users", getAllUsers);
router.get("/profile/:username", getProfile);
router.post("/profile/:username", addProfileView);
router.post("/account", updateUser);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
