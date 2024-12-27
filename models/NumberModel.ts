const mongoose = require("mongoose");
const userSchema = require("./UserModel");

const numberSchema = new mongoose.Schema({
  difficulty: String,
  min: Number,
  max: Number,
  value: Number,
  color: String,
  maxExperience: Number,
  attempts: Number,
  expires: Date,
  created: { type: Date, default: Date.now },
  global_user_guesses: { type: Number, default: 0 },
  correct_user_guesses: { type: Number, default: 0 },
  correct_users: [userSchema],
});

const NumberModel = mongoose.model("Number", numberSchema);

module.exports = NumberModel;
