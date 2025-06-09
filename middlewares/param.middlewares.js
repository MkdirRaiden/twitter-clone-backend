import { sanitize } from "express-xss-sanitizer";
import CustomError from "../modules/CustomError.js";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

// Generic ID validation
const checkEntityById = (model, paramKey, entityName) =>
    async (req, res, next, value) => {

        if (!value) {
            return next(new CustomError(`[DEBUG] Value for ${paramKey} is undefined`, 400));
        }

        if (!mongoose.Types.ObjectId.isValid(value)) {
            return next(new CustomError(`Invalid ${entityName} ID`, 400));
        }

        const sanitizedValue = sanitize(value.trim());
        req.params[paramKey] = sanitizedValue;

        const found = await model.findById(sanitizedValue);
        if (!found) {
            return next(new CustomError(`${entityName} with id: ${sanitizedValue} not found`, 404));
        }

        next();
    };

export const checkUserId = checkEntityById(User, "userId", "User");
export const checkPostId = checkEntityById(Post, "postId", "Post");
export const checkNotificationId = checkEntityById(Notification, "notificationId", "Notification");

// Username check 
export const checkUserUsername = async (req, res, next, value) => {
    const sanitized = sanitize(value.trim());
    const user = await User.findOne({ username: sanitized });
    if (!user) return next(new CustomError(`User not found`, 404));

    next();
};
