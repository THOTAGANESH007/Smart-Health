import Call from "../models/Call.js";

// Create a new call
export const createCall = async (req, res) => {
  try {
    const { doctorId, patientId } = req.body;

    // A simple unique ID combining timestamp and random string
    const roomId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    const call = await Call.create({
      doctorId,
      patientId,
      roomId,
    });

    res.status(201).json({ success: true, call });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating call", error: err.message });
  }
};

// Update call status (accept/reject/end)
export const updateCallStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { callId } = req.params;

    const updateData = { status };
    if (status === "ended") {
      updateData.callEndedAt = new Date();
    }

    const call = await Call.findByIdAndUpdate(callId, updateData, {
      new: true,
    });

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.status(200).json({ success: true, call });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating call status", error: err.message });
  }
};
