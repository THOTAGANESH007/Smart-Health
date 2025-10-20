import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Admin sends notifications
export const sendNotification = async (req, res) => {
  try {
    const { message, recipients } = req.body; // recipients can be 'all' or array of userIds
    let users = [];

    if (recipients === "all") {
      users = await User.find({}, "_id");
    } else {
      users = await User.find({ _id: { $in: recipients } }, "_id");
    }

    const notifications = users.map((u) => ({
      userId: u._id,
      message,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      message: "Notification(s) sent successfully",
      count: notifications.length,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error sending notifications", error: err.message });
  }
};

// Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .select("message isRead createdAt");

    res.status(200).json({ notifications });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err.message });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error marking notification", error: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ message: "Notification not found" });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting notification", error: err.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating notifications", error: err.message });
  }
};
