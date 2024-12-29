import { Request, Response } from "express";
import { Resend } from "resend";
import crypto from "crypto";
import User from "../models/UserModel";

const resend = new Resend(process.env.RESEND_API_KEY);

const verifyEmail = async (req: Request, res: Response) => {
  const { email, userId } = req.body;
  console.log("Received email request:", { email });

  const user = await User.findById(userId);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const currentTime = new Date();

  if (
    user.emailVerificationCode &&
    user.emailVerificationCodeExpiration &&
    user.emailVerificationCodeExpiration > currentTime
  ) {
    const timeRemaining =
      (user.emailVerificationCodeExpiration.getTime() - currentTime.getTime()) /
      60000;
    res.status(400).json({
      message: `Verification code already sent. Please wait ${Math.ceil(
        timeRemaining
      )} minutes.`,
    });
    return;
  }

  const verificationCode = crypto.randomInt(100000, 999999).toString();

  user.emailVerificationCode = verificationCode;
  user.emailVerificationCodeExpiration = new Date(Date.now() + 600000);
  await user.save();
  try {
    const data = await resend.emails.send({
      from: "Colin <mern-template@c-g.dev>",
      to: [email],
      subject: `Verification Code ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    });

    res.status(200).json({ message: "Verification code sent" });
  } catch (error) {
    res.status(400).json(error);
  }
};

const verifyCode = async (req: Request, res: Response) => {
  const { userId, code } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.emailVerificationCode !== code) {
      res.status(400).json({ message: "Invalid verification code" });
      return;
    }
    if (
      user.emailVerificationCodeExpiration &&
      user.emailVerificationCodeExpiration < new Date()
    ) {
      res.status(400).json({ message: "Verification code expired" });
      return;
    }
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpiration = undefined;
    user.verified = true;
    await user.save();
    res.status(200).json({ message: "Email verified" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export { verifyEmail, verifyCode };
