import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = {}; // profileId -> socket.id
  const activeRooms = {}; // roomId -> Map(socket.id -> username)

  // Helper to broadcast the full, updated user list for a room
  const broadcastUserList = (roomId) => {
    if (activeRooms[roomId]) {
      const users = Array.from(activeRooms[roomId].values()); // Send an array of usernames
      io.to(roomId).emit("update-user-list", users);
    }
  };

  io.on("connection", (socket) => {
    socket.on("register-user", (profileId) => {
      connectedUsers[profileId] = socket.id;
    });

    socket.on("initiate-call", ({ doctorId, patientId, roomId, callId }) => {
      const doctorSocket = connectedUsers[doctorId];
      if (doctorSocket) {
        io.to(doctorSocket).emit("incoming-call", {
          from: patientId,
          roomId,
          callId,
        });
      } else {
        io.to(socket.id).emit("doctor-offline", { doctorId });
      }
    });

    socket.on("accept-call", ({ patientId, roomId }) => {
      const patientSocket = connectedUsers[patientId];
      if (patientSocket) io.to(patientSocket).emit("call-accepted", { roomId });
    });

    socket.on("reject-call", ({ patientId }) => {
      const patientSocket = connectedUsers[patientId];
      if (patientSocket) io.to(patientSocket).emit("call-rejected");
    });

    socket.on("cancel-call", ({ doctorId }) => {
      const doctorSocket = connectedUsers[doctorId];
      if (doctorSocket) io.to(doctorSocket).emit("call-canceled");
    });

    socket.on("join-room", ({ roomId, username }) => {
      socket.username = username || "Anonymous";
      socket.join(roomId);

      if (!activeRooms[roomId]) {
        activeRooms[roomId] = new Map();
      }
      activeRooms[roomId].set(socket.id, socket.username);

      const existingUsers = [];
      for (const [sid, name] of activeRooms[roomId].entries()) {
        if (sid !== socket.id) {
          existingUsers.push({ id: sid, username: name });
        }
      }

      // The new user gets a list of everyone already in the room
      socket.emit("existing-users", existingUsers);

      broadcastUserList(roomId);
    });

    socket.on("offer", (data) => {
      io.to(data.target).emit("offer", {
        sdp: data.sdp,
        caller: socket.id,
        name: socket.username,
      });
    });

    socket.on("answer", (data) => {
      io.to(data.target).emit("answer", { sdp: data.sdp, caller: socket.id });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.target).emit("ice-candidate", {
        candidate: data.candidate,
        caller: socket.id,
      });
    });

    socket.on("chat-message", (data) => {
      io.to(data.roomId).emit("chat-message", {
        sender: socket.username,
        message: data.message,
      });
    });

    const handleLeave = () => {
      for (const rId in activeRooms) {
        if (activeRooms[rId]?.has(socket.id)) {
          activeRooms[rId].delete(socket.id);
          // Tell remaining users who left so they can clean up the connection
          socket.to(rId).emit("user-left", { peerId: socket.id });
          if (activeRooms[rId].size === 0) {
            delete activeRooms[rId];
          } else {
            broadcastUserList(rId);
          }
          break;
        }
      }
      for (const pid in connectedUsers) {
        if (connectedUsers[pid] === socket.id) delete connectedUsers[pid];
      }
    };

    socket.on("leave-room", handleLeave);
    socket.on("disconnect", handleLeave);
  });

  return io;
};
