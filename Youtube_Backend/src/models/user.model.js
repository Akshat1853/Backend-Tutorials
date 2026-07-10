import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// User Schema
const userSchema = new Schema(
  {
    // Unique username for every user
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // convert input to lowercase automatically
      trim: true, // remove extra spaces
      index: true, // create database index for faster searching
    },

    // User email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Full name displayed on profile
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // Cloudinary URL of user's avatar
    avatar: {
      type: String,
      required: true,
    },

    // Optional cover image URL
    coverImage: {
      type: String,
    },

    // Stores references to watched videos
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // Password will be stored in hashed form
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // Stores user's active refresh token
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  },
);

// PRE SAVE HOOK
// Runs automatically before saving a user document
userSchema.pre("save", async function (next) {
  // If password wasn't modified, skip hashing
  if (!this.isModified("password")) return next();

  // Hash password before storing
  this.password = await bcrypt.hash(this.password, 10);

  next();
});

// Compare entered password with stored hashed password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
