import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../types/User";

const userSchema = new Schema<User>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  emailVerificationCode: { type: String },
  verified: { type: Boolean, default: false },
  emailVerificationCodeExpiration: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpiration: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<User>("User", userSchema);

export default User;
