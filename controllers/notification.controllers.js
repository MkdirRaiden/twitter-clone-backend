import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/handlers/async.handlers.js";
import CustomError from "../modules/CustomError.js";

const sendResponseHelper = (res, statusCode, message, notification, notifications) => {
  res.status(statusCode).json({
    data: {
      status: true,
      message,
      notification,
      notifications,
    }
  });
}

// GET /notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.find({ to: userId }).populate({
    path: "from",
    select: "username profileImg fullName",
  });

  await Notification.updateMany({ to: userId }, { read: true });

  sendResponseHelper(res, 200, undefined, undefined, notifications);
});

// GET /notifications/new
export const getNewNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const newNotifications = await Notification.find({ to: userId, read: false });

  sendResponseHelper(res, 200, undefined, undefined, newNotifications);
});

// DELETE /notifications
export const deleteNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.deleteMany({ to: userId });

  const message = "All notifications deleted successfully!"
  sendResponseHelper(res, 200, message, undefined, undefined);
});

// DELETE /notifications/:notificationId
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findById(notificationId);

  if (notification.to.toString() !== userId.toString()) {
    return next(new CustomError("Unauthorized to delete this notification", 403));
  }

  await Notification.findByIdAndDelete(notificationId);

  const message = "Notification deleted successfully!";
  sendResponseHelper(res, 200, message, undefined, undefined);
});
