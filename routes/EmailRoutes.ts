import express from "express";
import { verifyCode, verifyEmail } from "../controllers/EmailController";

const router = express.Router();

router.post("/verify", verifyEmail);
router.post("/verify-code", verifyCode);
module.exports = router;
