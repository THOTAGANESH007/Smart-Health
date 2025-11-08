import express from "express";
import { createCall, updateCallStatus } from "../controllers/callController.js";

const callRouter = express.Router();

callRouter.post("/create", createCall);
callRouter.put("/:callId/status", updateCallStatus);

export default callRouter;
