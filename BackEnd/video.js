import { Server } from "socket.io";
import { protectVideo } from "./utils/protectVideo.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /*
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token; // sent from frontend
      const user = await protectVideo(token); // call our helper
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket auth failed:", err.message);
      next(new Error("Authentication error"));
    }
  });
  */

  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    socket.on("join-room", ({ roomId, username }) => {
      socket.username = username;
      socket.join(roomId);
      console.log(`👥 ${username} (${socket.id}) joined room ${roomId}`);

      socket.broadcast.to(roomId).emit("user-joined", socket.id, username);

      // Handle WebRTC offers
      socket.on("offer", (data) => {
        io.to(data.target).emit("offer", {
          sdp: data.sdp,
          caller: socket.id,
          name: socket.username,
        });
      });

      // Handle answers
      socket.on("answer", (data) => {
        io.to(data.target).emit("answer", { sdp: data.sdp, caller: socket.id });
      });

      // Handle ICE candidates
      socket.on("ice-candidate", (data) => {
        io.to(data.target).emit("ice-candidate", {
          candidate: data.candidate,
          caller: socket.id,
        });
      });

      // Chat message broadcast
      socket.on("chat-message", (data) => {
        io.to(roomId).emit("chat-message", {
          sender: socket.username,
          message: data.message,
        });
      });

      // Leave room
      socket.on("leave-room", () => {
        socket.leave(roomId);
        socket.broadcast.to(roomId).emit("user-left", socket.id);
        console.log(`🚪 ${socket.id} left room ${roomId}`);
      });

      socket.on("disconnect", () => {
        socket.broadcast.to(roomId).emit("user-left", socket.id);
        console.log(`❌ ${socket.id} disconnected from room ${roomId}`);
      });
    });
  });

  console.log("✅ Socket.IO signaling server initialized");
  return io;
};
