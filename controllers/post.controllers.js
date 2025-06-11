import asyncHandler from "../utils/handlers/async.handlers.js";
import CustomError from "../modules/CustomError.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { runPaginatedQuery } from "../utils/helpers/query.helpers.js";
import { sendPostResponse } from "../utils/helpers/response.helpers.js";
import {
  uploadImage,
  deleteImage,
} from "../utils/helpers/cloudinary.helpers.js";
import {
  createPostValidationSchema,
  updatePostValidationSchema,
} from "../utils/validations/post.validations.js";

// Shared populate config
const postPopulate = [
  { path: "user", select: "username profileImg fullName" },
  { path: "comments.user", select: "username profileImg" },
];

//  Create post
export const createPost = asyncHandler(async (req, res, next) => {
  const { value, error } = createPostValidationSchema.validate(req.body);
  if (error) return next(new CustomError(error.message, 400));

  const { text, img } = value;
  const imageUrl = img ? await uploadImage(img) : undefined;

  const post = await Post.create({
    user: req.user._id,
    text,
    img: imageUrl,
  });

  await post.populate("user", "username profileImg fullName");

  sendPostResponse(res, 201, post, undefined, "Post created successfully!");
});

//  Update post
export const updatePost = asyncHandler(async (req, res, next) => {
  const { value, error } = updatePostValidationSchema.validate(req.body);
  if (error) return next(new CustomError(error.message, 400));

  const post = await Post.findById(req.params.postId);
  if (!post || !post.user.equals(req.user._id)) {
    return next(new CustomError("Unauthorized", 403));
  }

  if (value.img) {
    if (post.img) await deleteImage(post.img);
    post.img = await uploadImage(value.img);
  }

  if (value.text !== undefined) {
    post.text = value.text;
  }

  await post.save();
  sendPostResponse(res, 200, post, undefined, "Post updated successfully!");
});

//  Delete post
export const deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post || !post.user.equals(req.user._id)) {
    return next(new CustomError("Unauthorized", 403));
  }

  if (post.img) await deleteImage(post.img);
  await Post.findByIdAndDelete(post._id);

  sendPostResponse(res, 200, undefined, undefined, "Post deleted successfully!");
});

//  Get all posts (For You feed)
export const getSuggestedPosts = asyncHandler(async (req, res, next) => {
  const { posts, page, totalPages } = await runPaginatedQuery({
    model: Post,
    filter: {}, // Show all posts
    req,
    next,
    sort: { createdAt: -1 }, // Newest first
    populate: postPopulate,
  });

  sendPostResponse(res, 200, undefined, posts, undefined, page, totalPages);
});

//  Get following users' posts
export const getFollowingPosts = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { posts, page, totalPages } = await runPaginatedQuery({
    model: Post,
    filter: { user: { $in: user.following } },
    req,
    next,
    sort: { createdAt: -1 },
    populate: postPopulate,
  });

  sendPostResponse(res, 200, undefined, posts, undefined, page, totalPages);
});

//  Get user posts (profile)
export const getUserPosts = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return next(new CustomError("User not found", 404));

  const { posts, page, totalPages } = await runPaginatedQuery({
    model: Post,
    filter: { user: user._id },
    req,
    next,
    sort: { createdAt: -1 },
    populate: postPopulate,
  });

  sendPostResponse(res, 200, undefined, posts, undefined, page, totalPages);
});

//  Get liked posts
export const getLikedPosts = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return next(new CustomError("User not found", 404));

  const { posts, page, totalPages } = await runPaginatedQuery({
    model: Post,
    filter: { _id: { $in: user.likedPosts } },
    req,
    next,
    sort: { createdAt: -1 },
    populate: postPopulate,
  });

  sendPostResponse(res, 200, undefined, posts, undefined, page, totalPages);
});

//  Comment on post
export const commentOnPost = asyncHandler(async (req, res, next) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new CustomError("Post not found", 404));
  if (!text) return next(new CustomError("Comment text is required", 400));

  post.comments.push({ text, user: req.user._id });
  await post.save();

  // Optional: create notification
  if (!post.user.equals(req.user._id)) {
    await Notification.create({
      from: req.user._id,
      to: post.user,
      type: "comment",
    });
  }

  // ✅ Refetch the post with populated comments
  const updatedPost = await Post.findById(post._id).populate([
    { path: "user", select: "username profileImg fullName" },
    { path: "comments.user", select: "username profileImg" },
  ]);

  sendPostResponse(res, 200, updatedPost, undefined, "Comment added successfully!");
});


//  Like/unlike post
export const likeUnlikePost = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new CustomError("Post not found", 404));

  const liked = post.likes.includes(userId);
  if (liked) {
    await Post.updateOne({ _id: post._id }, { $pull: { likes: userId } });
    await User.updateOne({ _id: userId }, { $pull: { likedPosts: post._id } });
    return sendPostResponse(res, 200, undefined, undefined, "Post unliked successfully!");
  }

  await Post.updateOne({ _id: post._id }, { $push: { likes: userId } });
  await User.updateOne({ _id: userId }, { $push: { likedPosts: post._id } });

  if (!post.user.equals(userId)) {
    await Notification.create({ from: userId, to: post.user, type: "like" });
  }

  sendPostResponse(res, 200, undefined, undefined, "Post liked successfully!");
});

//  Count posts by user
export const getUserPostCounts = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return next(new CustomError("User not found", 404));

  const count = await Post.countDocuments({ user: user._id });
  res.status(200).json({ data: { status: true, postsCount: count } });
});
