import { Request, Response } from "express";
import { Resend } from "resend";
import crypto from "crypto";
import User from "../models/UserModel";
import fs from "fs";
import path from "path";

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
    const { data, error } = await resend.emails.send({
      from: "Colin <mern-template@c-g.dev>",
      to: [email],
      subject: `Verification Code ${verificationCode}`,
      html: `<html dir="ltr" lang="en">
  <head>
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="background-color:#ffffff">
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:37.5em;padding-left:12px;padding-right:12px;margin:0 auto">
      <tbody>
        <tr style="width:100%">
          <td>
            <h1 style="color:#333;">Confirm your account.</h1>
            <p>MERN-Template</p>
            <p style="font-size:14px;">Your verification code is: <code>${verificationCode}</code></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`,
    });
    console.log("Resend data:", data);
    console.log("Resend error:", error);

    if (error) {
      res.status(500).json({
        message: "Error sending verification code",
        error: error.message,
      });
      return;
    }

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
