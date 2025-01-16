import express from "express";
import {verifyCode, verifyEmail, forgotPassword, verifyPasswordToken} from "../controllers/EmailController";

const router = express.Router();

router.post("/verify", verifyEmail);
router.post("/verify-code", verifyCode);
router.post("/forgot-password", forgotPassword)
router.post("/verify-password-code", verifyPasswordToken)
module.exports = router;
