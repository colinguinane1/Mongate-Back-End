import express from "express";
import {
  getUser,
  registerUser,
  loginUser,
  updateUser,
} from "../controllers/AuthController";
import { authenticateToken } from "../middleware/middleware";

const router = express.Router();

router.get("/user", authenticateToken, getUser);
router.post("/account", updateUser);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
