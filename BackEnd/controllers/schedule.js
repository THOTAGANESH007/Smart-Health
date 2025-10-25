import ScheduledNotification from "../models/ScheduledNotification.js";

export async function createScheduledNotification(req, res) {
  try {
    const { title, message, recipients, sendToAll, scheduledTime } = req.body;
    const localTime = new Date(scheduledTime);
    const utcTime = new Date(localTime.getTime());

    const notif = new ScheduledNotification({
      title,
      message,
      recipients: sendToAll ? [] : recipients,
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
    const list = await ScheduledNotification.find().sort({ scheduledTime: 1 });
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
