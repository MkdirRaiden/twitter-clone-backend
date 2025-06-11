import asyncHandler from "../utils/handlers/async.handlers.js";
import CustomError from "../modules/CustomError.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {
  signUpValidationSchema,
  loginValidationSchema,
} from "../utils/validations/user.validations.js";

// Generate and set JWT cookie, attach user to request
const generateTokenAndSetCookie = (payload, user, req, res) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined;
  user.__v = undefined;
  req.user = user;

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "none",
  });
};

// Helper to send auth response
const sendAuthResponse = (req, res, statusCode, message, user) => {
  const payload = { userId: user._id, email: user.email };
  generateTokenAndSetCookie(payload, user, req, res);

  res.status(statusCode).json({
    data: {
      status: true,
      user,
      message,
    },
  });
};

// Signup
export const signup = asyncHandler(async (req, res, next) => {
  const { value, error } = signUpValidationSchema.validate(req.body || {});
  if (error) return next(error);
  const newUser = await User.create(value);
  sendAuthResponse(
    req,
    res,
    201,
    "User created and logged in successfully!",
    newUser
  );
});

// Login
export const login = asyncHandler(async (req, res, next) => {
  const { value, error } = loginValidationSchema.validate(req.body || {});
  if (error) return next(error);

  const user = await User.findOne({ username: value.username }).select("+password");
  if (!user || !(await user.comparePassword(value.password, user.password))) {
    return next(new CustomError("Invalid credentials", 400));
  }

  sendAuthResponse(req, res, 200, "User logged in successfully!", user);
});

// Logout
export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  });

  res.status(200).json({
    data: {
      status: true,
      user: undefined,
      message: "Logged out successfully!",
    },
  });
});

// Get authenticated user
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new CustomError("User not found", 404));

  user.__v = undefined;
  user.password = undefined;

  res.status(200).json({
    data: {
      status: true,
      user,
      message: null,
    },
  });
});
