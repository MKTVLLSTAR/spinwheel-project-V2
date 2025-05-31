const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// User Schema (SuperAdmin & Admin)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "admin",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Prize Schema
const prizeSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Token Schema
const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Spin Result Schema
const spinResultSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
  },
  prizePosition: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  prizeName: {
    type: String,
    required: true,
  },
  spinAngle: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenSchema.index({ tokenId: 1 });
spinResultSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);
const Prize = mongoose.model("Prize", prizeSchema);
const Token = mongoose.model("Token", tokenSchema);
const SpinResult = mongoose.model("SpinResult", spinResultSchema);

module.exports = {
  User,
  Prize,
  Token,
  SpinResult,
};
