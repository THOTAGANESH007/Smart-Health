import express from "express";
import { v4 as uuidv4 } from "uuid";
import Call from "../models/Call.js";
const callRouter = express.Router();

// Create a new call
callRouter.post("/create", async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res
        .status(400)
        .json({ error: "Doctor ID and Patient ID are required" });
    }

    const roomId = uuidv4();

    const call = new Call({
      doctorId,
      patientId,
      roomId,
      status: "pending",
      callStartedAt: new Date(),
    });

    await call.save();

    res.status(201).json({ call });
  } catch (error) {
    console.error("Error creating call:", error);
    res.status(500).json({ error: "Failed to create call" });
  }
});

// Update call status
callRouter.put("/:callId/status", async (req, res) => {
  try {
    const { callId } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected", "ended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    call.status = status;

    if (status === "ended") {
      call.callEndedAt = new Date();
    }

    await call.save();

    res.json({ call });
  } catch (error) {
    console.error("Error updating call status:", error);
    res.status(500).json({ error: "Failed to update call status" });
  }
});

// Get all calls for a doctor
callRouter.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const calls = await Call.find({ doctorId })
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 calls

    res.json({ calls });
  } catch (error) {
    console.error("Error fetching doctor calls:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// Get all calls for a patient
callRouter.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const calls = await Call.find({ patientId })
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name email phone",
        },
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ calls });
  } catch (error) {
    console.error("Error fetching patient calls:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// Get call by ID
callRouter.get("/:callId", async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await Call.findById(callId)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone" },
      });

    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.json({ call });
  } catch (error) {
    console.error("Error fetching call:", error);
    res.status(500).json({ error: "Failed to fetch call" });
  }
});

export default callRouter;
