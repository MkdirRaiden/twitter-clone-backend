import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/handlers/async.handlers.js";
import CustomError from "../modules/CustomError.js"
import util from "util";


//middleware to protect routes
export const protectRoute = asyncHandler(async (req, res, next) => {
  //1. recieve the token from the cookie
  const _token = req.cookies.jwt;
  // console.log(_token);
  if (!_token) return next(
    new CustomError("You are logged out, please login first.", 403)
  );
  //2. verify the token
  const decodedToken = await util.promisify(jwt.verify)(
    _token,
    process.env.JWT_SECRET
  );
  //3. check if user still exists
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    const message = "User with the issued token not found, please sign up.";
    return next(new CustomError(message, 403));
  }
  //4. check if password is updated
  const isPasswordUpdated = user.isPasswordUpdated(decodedToken.iat);
  if (isPasswordUpdated) {
    const message = "Password has been updated recently, Please login again.";
    return next(new CustomError(message, 403));
  }
  //5. pass the user
  user.__v = undefined;
  req.user = user;
  next();
});