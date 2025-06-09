import asyncHandler from "../utils/handlers/async.handlers.js";
import CustomError from "../modules/CustomError.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { updateUserValidationSchema } from "../utils/validations/user.validations.js";
import { runPaginatedAggregate } from "../utils/helpers/query.helpers.js";
import { sendUserResponse } from "../utils/helpers/response.helpers.js";
import {
  uploadImage,
  deleteImage,
} from "../utils/helpers/cloudinary.helpers.js";

//  Search users
export const getSearchUsers = asyncHandler(async (req, res) => {
  const search = (req.query.search || "").trim();
  if (!search) return sendUserResponse(res, 200, undefined, [], "No results found!");

  const users = await User.find({
    username: { $regex: search, $options: "i" },
  }).select("-password");

  sendUserResponse(res, 200, undefined, users, undefined);
});


//  Get profile by username
export const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username }).select("-password");
  if (!user) return next(new CustomError("User not found", 404));
  sendUserResponse(res, 200, user, undefined, undefined);
});

// Follow or unfollow user
export const followUnfollowUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const currentUser = req.user;

  if (userId === currentUser._id.toString()) {
    return next(new CustomError("You cannot follow yourself!", 400));
  }

  const targetUser = await User.findById(userId);
  if (!targetUser) return next(new CustomError("User not found!", 404));

  const isFollowing = currentUser.following.includes(userId);

  if (isFollowing) {
    await User.findByIdAndUpdate(userId, { $pull: { followers: currentUser._id } });
    await User.findByIdAndUpdate(currentUser._id, { $pull: { following: userId } });
    return sendUserResponse(res, 200, undefined, undefined, "Unfollowed successfully!");
  }

  await User.findByIdAndUpdate(userId, { $push: { followers: currentUser._id } });
  await User.findByIdAndUpdate(currentUser._id, { $push: { following: userId } });

  await Notification.create({ type: "follow", from: currentUser._id, to: userId });

  sendUserResponse(res, 200, undefined, undefined, "Followed successfully!");
});

// People you may know (non-paginated)
export const PeopleYouMayKnow = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("following");
  const suggestions = await User.aggregate([
    {
      $match: {
        _id: { $ne: req.user._id, $nin: user.following },
        "followers.0": { $exists: true },
      },
    },
    { $limit: 8 },
  ]);
  sendUserResponse(res, 200, undefined, suggestions, undefined);
});

//  All suggested users (paginated)
export const allSuggestedUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("following");

  const { users, page, totalPages } = await runPaginatedAggregate({
    model: User,
    req,
    limit: 8,
    pipeline: [
      {
        $match: {
          _id: { $ne: req.user._id, $nin: user.following },
        },
      },
    ],
  });

  sendUserResponse(res, 200, undefined, users, undefined, page, totalPages);
});

//  Users you're following (paginated)
export const getFollowingUsers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.user.username });

  const { users, page, totalPages } = await runPaginatedAggregate({
    model: User,
    req,
    limit: 8,
    pipeline: [
      {
        $match: {
          _id: { $in: user.following },
        },
      },
    ],
  });

  sendUserResponse(res, 200, undefined, users, undefined, page, totalPages);
});

//  Suggested users (non-paginated, top 5)
export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select("following");

  const suggestedUsers = await User.find({
    _id: { $ne: req.user._id, $nin: currentUser.following },
  })
    .select("-password")
    .limit(5);

  sendUserResponse(res, 200, undefined, suggestedUsers, undefined);
});

//  Update profile
export const updateUser = asyncHandler(async (req, res, next) => {
  const { value, error } = updateUserValidationSchema.validate(req.body || {});
  if (error) return next(error);

  const { fullName, email, username, bio, link, profileImg, coverImg } = value;

  const user = await User.findById(req.user._id);
  if (!user) return next(new CustomError("User not found!", 404));

  // Check for unique username/email
  if (
    username &&
    username !== user.username &&
    (await User.findOne({ username }))
  ) {
    return next(new CustomError("Username already taken", 400));
  }

  if (
    email &&
    email !== user.email &&
    (await User.findOne({ email }))
  ) {
    return next(new CustomError("Email already taken", 400));
  }

  // Handle image uploads
  if (profileImg) {
    if (user.profileImg) await deleteImage(user.profileImg);
    user.profileImg = await uploadImage(profileImg);
  }

  if (coverImg) {
    if (user.coverImg) await deleteImage(user.coverImg);
    user.coverImg = await uploadImage(coverImg);
  }

  // Apply updates
  Object.assign(user, {
    fullName: fullName ?? user.fullName,
    email: email ?? user.email,
    username: username ?? user.username,
    bio: bio ?? user.bio,
    link: link ?? user.link,
  });

  await user.save();

  user.password = undefined;
  sendUserResponse(res, 200, user, undefined, "Profile updated successfully!");
});
