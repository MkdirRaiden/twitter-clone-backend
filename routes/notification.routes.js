import express from "express";
import { protectRoute } from "../middlewares/protect.midldlewares.js";
import { checkNotificationId } from "../middlewares/param.middlewares.js";
import {
  getNewNotifications,
  getNotifications,
  deleteNotification,
  deleteNotifications,
} from "../controllers/notification.controllers.js";

const router = express.Router();

// Validate notification ID
router.param("notificationId", checkNotificationId);

// Get all notifications / delete all
router.route("/")
  .get(protectRoute, getNotifications)
  .delete(protectRoute, deleteNotifications);

// Get new/unread notifications
router.get("/new", protectRoute, getNewNotifications);

// Delete single notification
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;
