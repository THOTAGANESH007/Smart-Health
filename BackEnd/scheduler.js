import cron from "node-cron";
import ScheduledNotification from "./models/ScheduledNotification.js";
import { sendNotification } from "./config/fcm.js";
import User from "./models/User.js";

/**
 * Convert a Date object to IST timezone
 */
function toIST(date) {
  const offset = 5.5 * 60 * 60 * 1000; // IST = UTC + 5:30
  return new Date(date.getTime() + offset);
}

export default function startScheduler() {
  // console.log("Notification Scheduler initialized...");

  // Runs every minute
  cron.schedule("* * * * *", async () => {
    const nowUTC = new Date();
    const nowIST = toIST(nowUTC);

    console.log(
      "Scheduler triggered at (IST):",
      nowIST.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );

    try {
      // Log all notifications for debugging
      const all = await ScheduledNotification.find().sort({ scheduledTime: 1 });
      // console.log("All scheduled notifications in DB:");
      all.forEach((n) => {
        const istTime = toIST(n.scheduledTime);
        // console.log(
        //   `   ➡️ ${n.title} | Time (IST): ${istTime.toLocaleString("en-IN", {
        //     timeZone: "Asia/Kolkata",
        //   })} | Sent: ${n.isSent}`
        // );
      });

      // Find due unsent notifications (compare with IST)
      const dueNotifications = await ScheduledNotification.find({
        scheduledTime: { $lte: nowIST },
        isSent: false,
      });

      // console.log("Found", dueNotifications.length, "due notifications");

      for (const notif of dueNotifications) {
        // console.log("Processing Notification ID:", notif._id);
        // console.log("Title:", notif.title);
        // console.log(
        //   "Scheduled (IST):",
        //   toIST(notif.scheduledTime).toLocaleString("en-IN", {
        //     timeZone: "Asia/Kolkata",
        //   })
        // );

        let users = [];
        if (notif.sendToAll) {
          // console.log("Sending to ALL users");
          users = await User.find({}, "fcmToken name");
        } else {
          // console.log("Sending to selected users:", notif.recipients);
          users = await User.find(
            { _id: { $in: notif.recipients } },
            "fcmToken name"
          );
        }

        // Extract valid FCM tokens
        const tokens = users.map((u) => u.fcmToken).filter(Boolean);
        // console.log("Valid FCM Tokens Found:", tokens.length);

        if (tokens.length > 0) {
          await sendNotification(tokens, notif.title, notif.message);
          // console.log(`Notification sent successfully: ${notif.title}`);
        } else {
          // console.log("No valid FCM tokens found for recipients");
        }

        // Mark as sent
        notif.isSent = true;
        await notif.save();
        // console.log(`Marked as sent: ${notif._id}`);
      }
    } catch (err) {
      // console.error("Scheduler Error:", err);
    }
  });
}
