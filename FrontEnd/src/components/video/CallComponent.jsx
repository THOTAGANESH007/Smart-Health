import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true });

const CallComponent = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.name || "User";

  const [inCall, setInCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  const localVideoRef = useRef();
  const pcRef = useRef({});
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const audioAnalyzersRef = useRef({});

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    if (!roomId || !username) {
      console.error("Missing roomId or username");
      return;
    }

    const createPeerConnection = (peerId, peerName) => {
      console.log(`Creating peer connection for ${peerName} (${peerId})`);

      // Close existing connection if any
      if (pcRef.current[peerId]) {
        pcRef.current[peerId].close();
      }

      const pc = new RTCPeerConnection(servers);
      pcRef.current[peerId] = pc;

      // Add local tracks to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
          console.log(
            `Added ${track.kind} track to peer connection for ${peerName}`
          );
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log(`Received track from ${peerName}:`, event.track.kind);

        setRemoteStreams((prev) => ({
          ...prev,
          [peerId]: {
            stream: event.streams[0],
            name: peerName,
          },
        }));

        startAudioDetection(event.streams[0], peerId);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${peerId}`);
          socket.emit("ice-candidate", {
            target: peerId,
            candidate: event.candidate,
          });
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state for ${peerId}: ${pc.iceConnectionState}`
        );
        if (pc.iceConnectionState === "failed") {
          console.error(
            `ICE connection failed for ${peerId}, attempting restart`
          );
          pc.restartIce();
        } else if (pc.iceConnectionState === "disconnected") {
          console.warn(`Peer ${peerId} disconnected`);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`Connection state for ${peerId}: ${pc.connectionState}`);
      };

      return pc;
    };

    const joinRoom = async () => {
      try {
        console.log("Requesting media devices...");
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        console.log("Media devices acquired successfully");

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        localStreamRef.current = localStream;
        startAudioDetection(localStream, username);
        setInCall(true);

        console.log(`Joining room ${roomId} as ${username}`);
        socket.emit("join-room", { roomId, username });
      } catch (err) {
        console.error("Failed to get local stream", err);
        alert(
          "Could not access camera or microphone. Please check permissions."
        );
        navigate(user?.role === "DOCTOR" ? "/doctor/popup" : "/patient/list");
      }
    };

    joinRoom();

    // Socket event handlers
    socket.on("update-user-list", (users) => {
      console.log("Updated user list:", users);
      setRoomUsers(users);
    });

    socket.on("existing-users", async (users) => {
      console.log("Existing users in room:", users);

      for (const u of users) {
        try {
          console.log(`Creating offer for ${u.username} (${u.id})`);
          const pc = createPeerConnection(u.id, u.username);

          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });

          await pc.setLocalDescription(offer);
          console.log(`Sending offer to ${u.username}`);
          socket.emit("offer", { target: u.id, sdp: offer });
        } catch (err) {
          console.error(`Error creating offer for ${u.username}:`, err);
        }
      }
    });

    socket.on("user-joined", ({ peerId, peerName }) => {
      console.log(`${peerName} (${peerId}) has joined the call.`);
    });

    socket.on("user-left", ({ peerId }) => {
      console.log(`User ${peerId} left the call`);

      if (pcRef.current[peerId]) {
        pcRef.current[peerId].close();
        delete pcRef.current[peerId];
      }

      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[peerId];
        return updated;
      });

      if (audioAnalyzersRef.current[peerId]) {
        if (audioAnalyzersRef.current[peerId].ctx) {
          audioAnalyzersRef.current[peerId].ctx.close();
        }
        if (audioAnalyzersRef.current[peerId].interval) {
          clearInterval(audioAnalyzersRef.current[peerId].interval);
        }
        delete audioAnalyzersRef.current[peerId];
      }
    });

    socket.on("offer", async (data) => {
      const { caller, sdp, name: callerName } = data;
      console.log(`Received offer from ${callerName} (${caller})`);

      try {
        const pc = createPeerConnection(caller, callerName);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        console.log(`Sending answer to ${callerName}`);
        socket.emit("answer", { target: caller, sdp: answer });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    socket.on("answer", async (data) => {
      console.log(`Received answer from ${data.caller}`);

      try {
        if (pcRef.current[data.caller]) {
          await pcRef.current[data.caller].setRemoteDescription(
            new RTCSessionDescription(data.sdp)
          );
          console.log(`Remote description set for ${data.caller}`);
        } else {
          console.error(`No peer connection found for ${data.caller}`);
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    socket.on("ice-candidate", async (data) => {
      try {
        if (pcRef.current[data.caller]) {
          await pcRef.current[data.caller].addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
          console.log(`ICE candidate added for ${data.caller}`);
        } else {
          console.warn(
            `No peer connection for ICE candidate from ${data.caller}`
          );
        }
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    });

    const handleCallRejected = () => {
      alert("The doctor rejected the call.");
      leaveCall(true);
    };

    const handleDoctorOffline = () => {
      alert("The doctor appears to be offline.");
      leaveCall(true);
    };

    socket.on("call-rejected", handleCallRejected);
    socket.on("doctor-offline", handleDoctorOffline);

    // Cleanup function
    return () => {
      console.log("Cleaning up call component");

      socket.emit("leave-room", roomId);

      Object.values(pcRef.current).forEach((pc) => {
        pc.close();
      });

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      Object.values(audioAnalyzersRef.current).forEach((analyzer) => {
        if (analyzer.ctx) analyzer.ctx.close();
        if (analyzer.interval) clearInterval(analyzer.interval);
      });

      socket.off("update-user-list");
      socket.off("existing-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      socket.off("call-rejected", handleCallRejected);
      socket.off("doctor-offline", handleDoctorOffline);
    };
  }, [roomId, username, navigate, user?.role]);

  const startAudioDetection = (stream, id) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (avg > 20) {
          setSpeakingId(id);
          setTimeout(() => setSpeakingId(null), 500);
        }
      };

      const interval = setInterval(checkVolume, 200);
      audioAnalyzersRef.current[id] = {
        analyser,
        dataArray,
        id,
        interval,
        ctx,
      };
    } catch (err) {
      console.warn("Audio detection init failed:", err);
    }
  };

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (!tracks?.length) return;
    tracks[0].enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (!tracks?.length) return;
    tracks[0].enabled = !videoEnabled;
    setVideoEnabled(!videoEnabled);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenStreamRef.current = screenStream;

        // Replace video track in all peer connections
        Object.values(pcRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        localVideoRef.current.srcObject = screenStream;

        screenTrack.onended = () => toggleScreenShare();
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      const camTrack = localStreamRef.current?.getVideoTracks()[0];

      // Replace back to camera track
      Object.values(pcRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender && camTrack) sender.replaceTrack(camTrack);
      });

      localVideoRef.current.srcObject = localStreamRef.current;

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      setScreenSharing(false);
    }
  };

  const leaveCall = (isSilent = false) => {
    if (!isSilent) socket.emit("leave-room", roomId);
    setInCall(false);
    setCallEnded(true);

    setTimeout(() => {
      setCallEnded(false);
      navigate(user?.role === "DOCTOR" ? "/doctor/popup" : "/patient/list");
    }, 2000);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("chat-message", { roomId, message: chatInput });
    setMessages((prev) => [...prev, `You: ${chatInput}`]);
    setChatInput("");
  };

  if (callEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 text-black">
        <h1 className="text-3xl font-bold mb-4">📞 Call Ended</h1>
        <p className="text-lg text-gray-700">Returning to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-200 min-h-screen text-black">
      {inCall ? (
        <div className="flex flex-col gap-6">
          <div className="text-center font-semibold text-lg bg-white/70 p-3 rounded-md shadow">
            👥 Users in room:{" "}
            {roomUsers.length > 0 ? roomUsers.join(", ") : "Connecting..."}
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
            {/* Local Video */}
            <div className="flex flex-col items-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`rounded-md border-4 transition-all duration-200 ${
                  speakingId === username
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                    : "border-gray-300"
                }`}
                style={{ width: "400px", height: "300px", objectFit: "cover" }}
              />
              <div className="mt-2 font-semibold bg-blue-600 text-white px-3 py-1 rounded">
                {username} (You)
              </div>
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([peerId, data]) => (
              <div key={peerId} className="flex flex-col items-center">
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el && data.stream) {
                      el.srcObject = data.stream;
                    }
                  }}
                  className={`rounded-md border-4 transition-all duration-200 ${
                    speakingId === peerId
                      ? "border-yellow-400 shadow-lg shadow-yellow-400/50"
                      : "border-gray-300"
                  }`}
                  style={{
                    width: "400px",
                    height: "300px",
                    objectFit: "cover",
                  }}
                />
                <div className="mt-2 font-semibold bg-green-600 text-white px-3 py-1 rounded">
                  {data.name}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={toggleAudio}
              className={`px-4 py-2 rounded-md text-white transition ${
                audioEnabled
                  ? "bg-gray-700 hover:bg-gray-800"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {audioEnabled ? "🎤 Mute" : "🔇 Unmute"}
            </button>
            <button
              onClick={toggleVideo}
              className={`px-4 py-2 rounded-md text-white transition ${
                videoEnabled
                  ? "bg-gray-700 hover:bg-gray-800"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {videoEnabled ? "📹 Stop Video" : "📹 Start Video"}
            </button>
            <button
              onClick={toggleScreenShare}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              {screenSharing ? "🛑 Stop Sharing" : "🖥️ Share Screen"}
            </button>
            <button
              onClick={() => leaveCall()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              📞 Leave Call
            </button>
          </div>

          <div className="flex gap-2 mt-4 max-w-3xl mx-auto w-full">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="border px-3 py-2 rounded-md flex-1 h-9 resize-none text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
            >
              Send
            </button>
          </div>

          <div className="border border-gray-400 rounded-md p-3 h-64 overflow-y-auto max-w-3xl mx-auto w-full bg-white text-black">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="text-sm mb-1">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-2xl font-semibold">Connecting to call...</p>
        </div>
      )}
    </div>
  );
};

export default CallComponent;
