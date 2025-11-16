import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL , "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = {}; // profileId -> socket.id
  const activeRooms = {}; // roomId -> Map(socket.id -> username)

  // Helper to broadcast the full, updated user list for a room
  const broadcastUserList = (roomId) => {
    if (activeRooms[roomId]) {
      const users = Array.from(activeRooms[roomId].values());
      io.to(roomId).emit("update-user-list", users);
    }
  };

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register-user", (profileId) => {
      connectedUsers[profileId] = socket.id;
      console.log(`User registered: ${profileId} -> ${socket.id}`);
    });

    socket.on("initiate-call", ({ doctorId, patientId, roomId, callId }) => {
      const doctorSocket = connectedUsers[doctorId];
      console.log(`Call initiated: Patient ${patientId} -> Doctor ${doctorId}`);

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
      console.log(`Call accepted: Doctor -> Patient ${patientId}`);

      if (patientSocket) {
        io.to(patientSocket).emit("call-accepted", { roomId });
      }
    });

    socket.on("reject-call", ({ patientId }) => {
      const patientSocket = connectedUsers[patientId];
      console.log(`Call rejected: Patient ${patientId}`);

      if (patientSocket) {
        io.to(patientSocket).emit("call-rejected");
      }
    });

    socket.on("cancel-call", ({ doctorId }) => {
      const doctorSocket = connectedUsers[doctorId];
      console.log(`Call canceled: Doctor ${doctorId}`);

      if (doctorSocket) {
        io.to(doctorSocket).emit("call-canceled");
      }
    });

    socket.on("join-room", ({ roomId, username }) => {
      socket.username = username || "Anonymous";
      socket.join(roomId);

      if (!activeRooms[roomId]) {
        activeRooms[roomId] = new Map();
      }
      activeRooms[roomId].set(socket.id, socket.username);

      console.log(`${username} joined room ${roomId}`);

      // Get list of existing users in the room (excluding the new joiner)
      const existingUsers = [];
      for (const [sid, name] of activeRooms[roomId].entries()) {
        if (sid !== socket.id) {
          existingUsers.push({ id: sid, username: name });
        }
      }

      // Send existing users to the new joiner
      socket.emit("existing-users", existingUsers);

      // Notify existing users about the new joiner
      socket.to(roomId).emit("user-joined", {
        peerId: socket.id,
        peerName: socket.username,
      });

      // Broadcast updated user list to everyone
      broadcastUserList(roomId);
    });

    socket.on("offer", (data) => {
      console.log(`Offer sent from ${socket.id} to ${data.target}`);
      io.to(data.target).emit("offer", {
        sdp: data.sdp,
        caller: socket.id,
        name: socket.username,
      });
    });

    socket.on("answer", (data) => {
      console.log(`Answer sent from ${socket.id} to ${data.target}`);
      io.to(data.target).emit("answer", {
        sdp: data.sdp,
        caller: socket.id,
      });
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
      console.log(`User ${socket.id} leaving`);

      // Remove from all rooms
      for (const rId in activeRooms) {
        if (activeRooms[rId]?.has(socket.id)) {
          activeRooms[rId].delete(socket.id);

          // Notify others in the room
          socket.to(rId).emit("user-left", { peerId: socket.id });

          if (activeRooms[rId].size === 0) {
            delete activeRooms[rId];
          } else {
            broadcastUserList(rId);
          }
          break;
        }
      }

      // Remove from connected users
      for (const pid in connectedUsers) {
        if (connectedUsers[pid] === socket.id) {
          delete connectedUsers[pid];
        }
      }
    };

    socket.on("leave-room", handleLeave);
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      handleLeave();
    });
  });

  return io;
};
