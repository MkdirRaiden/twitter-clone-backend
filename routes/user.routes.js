import express from "express";
import { protectRoute } from "../middlewares/protect.midldlewares.js";
import {
  getUserProfile,
  updateUser,
  getFollowingUsers,
  followUnfollowUser,
  getSearchUsers,
  getSuggestedUsers,
  allSuggestedUsers,
  PeopleYouMayKnow,
} from "../controllers/user.controllers.js";
import {
  getUserPostCounts,
  getUserPosts,
  getLikedPosts,
} from "../controllers/post.controllers.js";
import {
  checkUserId,
  checkUserUsername,
} from "../middlewares/param.middlewares.js";

const router = express.Router();

// validate params
router.param("userId", checkUserId);
router.param("username", checkUserUsername);

// Discovery & Suggestions
router.get("/search", protectRoute, getSearchUsers);
router.get("/suggestions", protectRoute, getSuggestedUsers);
router.get("/suggestions/all", protectRoute, allSuggestedUsers);
router.get("/suggestions/people-you-may-know", protectRoute, PeopleYouMayKnow);

// Follow System
router.get("/following", protectRoute, getFollowingUsers);
router.post("/:userId/follow", protectRoute, followUnfollowUser);

// Profile & Account
router.route("/profile/:username")
  .get(protectRoute, getUserProfile)
  .patch(protectRoute, updateUser);

// Posts & Likes
router.get("/profile/:username/posts", protectRoute, getUserPosts);
router.get("/profile/:username/posts/count", protectRoute, getUserPostCounts);
router.get("/profile/:username/likes", protectRoute, getLikedPosts);

export default router;
