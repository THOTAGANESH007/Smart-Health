import ScheduledNotification from "../models/ScheduledNotification.js";
import User from "../models/User.js";

export async function createScheduledNotification(req, res) {
  try {
    const { title, message, recipients, sendToAll, scheduledTime } = req.body;

    const localTime = new Date(scheduledTime);
    const utcTime = new Date(localTime.getTime());
console.log("rrr",recipients)
    let recipientList = [];

    if (sendToAll) {
      // Fetch all users if "send to all" is true
      const users = await User.find();
      recipientList = users.map((user) => ({
        user: user._id,
        isRead: false,
      }));
    } else if (recipients && recipients.length > 0) {
      // Use only specified recipients
      recipientList = recipients.map((id) => ({
        user: id,
        isRead: false,
      }));
    } else {
      return res.status(400).json({ error: "Recipients list is empty." });
    }

    const notif = new ScheduledNotification({
      title,
      message,
      recipients: recipientList,
      sendToAll,
      scheduledTime: utcTime,
    });

    await notif.save();
    res.status(201).json({ message: "Notification scheduled successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function getAllScheduledNotifications(req, res) {
  try {
    const list = await ScheduledNotification.find().sort({ scheduledTime: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteScheduledNotification(req, res) {
  try {
    const notif = await ScheduledNotification.findById(req.params.id);
    if (!notif) return res.status(404).json({ message: "Not found" });
    if (notif.isSent) return res.status(400).json({ message: "Already sent" });

    await notif.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
