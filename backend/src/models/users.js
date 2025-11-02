// Users Schema
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, unique: true, required: true },
    role: { type: String, enum: ["Member", "Admin"], default: "Member" },
    status: { type: String, enum: ["active", "inActive"], default: "active" },
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);
module.exports = User;
