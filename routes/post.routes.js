import express from "express";
import { protectRoute } from "../middlewares/protect.midldlewares.js";
import { checkPostId } from "../middlewares/param.middlewares.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnlikePost,
  getFollowingPosts,
} from "../controllers/post.controllers.js";

const router = express.Router();

//validate post id
router.param("postId", checkPostId);

router.get("/feed/following", protectRoute, getFollowingPosts);
//get all posts, create posts and delete post
router.route("/").post(protectRoute, createPost);

router.delete("/:postId", protectRoute, deletePost);

//actions on posts like like, and following posts
router.post("/:postId/comments", protectRoute, commentOnPost);
router.post("/:postId/like", protectRoute, likeUnlikePost);

export default router;
