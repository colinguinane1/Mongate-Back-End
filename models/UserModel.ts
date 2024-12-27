import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
const NumberModel = require("./NumberModel");

interface IModeData {
  attempts: number;
  win: boolean;
  guesses: number[];
}

interface IUser extends Document {
  username: string;
  email: string;
  current_number_data: Map<string, IModeData>; // Use Map explicitly
  guessed_numbers: typeof NumberModel[];
  xp: number;
  profile_views: number;
  password: string;
  matchPassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  current_number_data: {
    type: Map,
    of: new Schema({
      attempts: { type: Number, required: true, default: 0 },
      win: { type: Boolean, required: true, default: false },
      guesses: [{ type: Number, default: [] }],
    }),
    default: {},
  },
  guessed_numbers: [{ type: Object }],
  xp: { type: Number, default: 0 },
  profile_views: { type: Number, default: 0 },
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

const User = mongoose.model<IUser>("User", userSchema);

export default User;
