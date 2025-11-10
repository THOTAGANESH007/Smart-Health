import React, { useRef, useState, useEffect, useCallback } from "react";
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
  const remoteVideoRefs = useRef({});
  const pcRef = useRef({});
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const audioAnalyzersRef = useRef({});
  const pendingCandidatesRef = useRef({});
  const isCreatingConnectionRef = useRef({});

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  };

  // Memoized function to create peer connection
  const createPeerConnection = useCallback((peerId, peerName) => {
    console.log(`[createPeerConnection] Creating for ${peerName} (${peerId})`);

    // Check if already creating connection
    if (isCreatingConnectionRef.current[peerId]) {
      console.log(`[createPeerConnection] Already creating connection for ${peerId}`);
      return pcRef.current[peerId];
    }

    // Check if connection exists and is in good state
    if (pcRef.current[peerId]) {
      const state = pcRef.current[peerId].connectionState;
      if (state === "connected" || state === "connecting") {
        console.log(`[createPeerConnection] Reusing existing connection for ${peerId}`);
        return pcRef.current[peerId];
      }
      // Close bad connection
      console.log(`[createPeerConnection] Closing bad connection (${state}) for ${peerId}`);
      pcRef.current[peerId].close();
    }

    isCreatingConnectionRef.current[peerId] = true;

    try {
      const pc = new RTCPeerConnection(servers);
      pcRef.current[peerId] = pc;
      pendingCandidatesRef.current[peerId] = [];

      console.log(`[createPeerConnection] RTCPeerConnection created for ${peerId}`);

      // Add local stream tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, localStreamRef.current);
          console.log(`[createPeerConnection] Added ${track.kind} track for ${peerName}`, {
            trackId: track.id,
            enabled: track.enabled,
            readyState: track.readyState
          });
        });
      } else {
        console.error(`[createPeerConnection] No local stream available!`);
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log(`[ontrack] Received from ${peerName}:`, {
          kind: event.track.kind,
          trackId: event.track.id,
          streamId: event.streams[0]?.id,
          readyState: event.track.readyState
        });

        const stream = event.streams[0];
        
        if (!stream) {
          console.error(`[ontrack] No stream in event for ${peerId}`);
          return;
        }

        // Update remote streams
        setRemoteStreams((prev) => {
          const newStreams = { ...prev };
          
          if (!newStreams[peerId]) {
            newStreams[peerId] = {
              stream: stream,
              name: peerName,
            };
          } else {
            // Update existing stream
            newStreams[peerId].stream = stream;
          }
          
          console.log(`[ontrack] Updated remote streams for ${peerId}`, {
            totalStreams: Object.keys(newStreams).length,
            streamTracks: stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled }))
          });
          
          return newStreams;
        });

        // Attach to video element immediately if it exists
        if (remoteVideoRefs.current[peerId]) {
          remoteVideoRefs.current[peerId].srcObject = stream;
          console.log(`[ontrack] Attached stream to video element for ${peerId}`);
        }

        // Start audio detection
        startAudioDetection(stream, peerId);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`[onicecandidate] Sending to ${peerId}`);
          socket.emit("ice-candidate", {
            target: peerId,
            candidate: event.candidate,
          });
        } else {
          console.log(`[onicecandidate] All ICE candidates sent for ${peerId}`);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[oniceconnectionstatechange] ${peerId}: ${pc.iceConnectionState}`);
        
        if (pc.iceConnectionState === "failed") {
          console.error(`[oniceconnectionstatechange] ICE failed for ${peerId}, restarting`);
          pc.restartIce();
        } else if (pc.iceConnectionState === "disconnected") {
          console.warn(`[oniceconnectionstatechange] ${peerId} disconnected`);
        } else if (pc.iceConnectionState === "connected") {
          console.log(`[oniceconnectionstatechange] ${peerId} connected successfully!`);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[onconnectionstatechange] ${peerId}: ${pc.connectionState}`);
      };

      pc.onsignalingstatechange = () => {
        console.log(`[onsignalingstatechange] ${peerId}: ${pc.signalingState}`);
      };

      return pc;
    } finally {
      isCreatingConnectionRef.current[peerId] = false;
    }
  }, []);

  const startAudioDetection = useCallback((stream, id) => {
    try {
      // Clean up existing analyzer
      if (audioAnalyzersRef.current[id]) {
        if (audioAnalyzersRef.current[id].ctx) {
          audioAnalyzersRef.current[id].ctx.close();
        }
        if (audioAnalyzersRef.current[id].interval) {
          clearInterval(audioAnalyzersRef.current[id].interval);
        }
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        console.log(`[startAudioDetection] No audio track for ${id}`);
        return;
      }

      console.log(`[startAudioDetection] Starting for ${id}`);

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
      console.error(`[startAudioDetection] Error for ${id}:`, err);
    }
  }, []);

  const handlePeerDisconnect = useCallback((peerId) => {
    console.log(`[handlePeerDisconnect] Cleaning up ${peerId}`);

    if (pcRef.current[peerId]) {
      pcRef.current[peerId].close();
      delete pcRef.current[peerId];
    }

    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[peerId];
      return updated;
    });

    if (remoteVideoRefs.current[peerId]) {
      remoteVideoRefs.current[peerId].srcObject = null;
      delete remoteVideoRefs.current[peerId];
    }

    if (audioAnalyzersRef.current[peerId]) {
      if (audioAnalyzersRef.current[peerId].ctx) {
        audioAnalyzersRef.current[peerId].ctx.close();
      }
      if (audioAnalyzersRef.current[peerId].interval) {
        clearInterval(audioAnalyzersRef.current[peerId].interval);
      }
      delete audioAnalyzersRef.current[peerId];
    }

    delete pendingCandidatesRef.current[peerId];
    delete isCreatingConnectionRef.current[peerId];
  }, []);

  useEffect(() => {
    if (!roomId || !username) {
      console.error("[useEffect] Missing roomId or username");
      return;
    }

    console.log("[useEffect] Initializing call component");

    const joinRoom = async () => {
      try {
        console.log("[joinRoom] Requesting media devices...");
        
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
          },
        });

        console.log("[joinRoom] Media acquired:", {
          videoTracks: localStream.getVideoTracks().length,
          audioTracks: localStream.getAudioTracks().length,
          videoTrack: localStream.getVideoTracks()[0]?.getSettings(),
          audioTrack: localStream.getAudioTracks()[0]?.getSettings(),
        });

        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
          console.log("[joinRoom] Local video attached");
        }

        startAudioDetection(localStream, username);
        setInCall(true);

        console.log(`[joinRoom] Emitting join-room for ${roomId}`);
        socket.emit("join-room", { roomId, username });
      } catch (err) {
        console.error("[joinRoom] Error:", err);
        alert(`Could not access camera or microphone: ${err.message}`);
        navigate(user?.role === "DOCTOR" ? "/doctor/popup" : "/patient/list");
      }
    };

    joinRoom();

    // Socket handlers
    socket.on("update-user-list", (users) => {
      console.log("[update-user-list]", users);
      setRoomUsers(users);
    });

    socket.on("existing-users", async (users) => {
      console.log("[existing-users]", users);

      for (const u of users) {
        if (isCreatingConnectionRef.current[u.id]) {
          console.log(`[existing-users] Skipping ${u.id}, already creating`);
          continue;
        }

        try {
          console.log(`[existing-users] Creating offer for ${u.username} (${u.id})`);
          
          const pc = createPeerConnection(u.id, u.username);

          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });

          await pc.setLocalDescription(offer);
          console.log(`[existing-users] Offer created and set for ${u.username}`);
          
          socket.emit("offer", { target: u.id, sdp: offer });
        } catch (err) {
          console.error(`[existing-users] Error for ${u.username}:`, err);
        }
      }
    });

    socket.on("user-joined", ({ peerId, peerName }) => {
      console.log(`[user-joined] ${peerName} (${peerId})`);
    });

    socket.on("user-left", ({ peerId }) => {
      console.log(`[user-left] ${peerId}`);
      handlePeerDisconnect(peerId);
    });

    socket.on("offer", async (data) => {
      const { caller, sdp, name: callerName } = data;
      console.log(`[offer] Received from ${callerName} (${caller})`);

      try {
        const pc = createPeerConnection(caller, callerName);
        
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log(`[offer] Remote description set for ${caller}`);

        // Add pending ICE candidates
        if (pendingCandidatesRef.current[caller]?.length > 0) {
          console.log(`[offer] Adding ${pendingCandidatesRef.current[caller].length} pending candidates`);
          for (const candidate of pendingCandidatesRef.current[caller]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidatesRef.current[caller] = [];
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`[offer] Answer created for ${caller}`);

        socket.emit("answer", { target: caller, sdp: answer });
      } catch (err) {
        console.error("[offer] Error:", err);
      }
    });

    socket.on("answer", async (data) => {
      console.log(`[answer] Received from ${data.caller}`);

      try {
        const pc = pcRef.current[data.caller];
        if (!pc) {
          console.error(`[answer] No peer connection for ${data.caller}`);
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        console.log(`[answer] Remote description set for ${data.caller}`);

        // Add pending ICE candidates
        if (pendingCandidatesRef.current[data.caller]?.length > 0) {
          console.log(`[answer] Adding ${pendingCandidatesRef.current[data.caller].length} pending candidates`);
          for (const candidate of pendingCandidatesRef.current[data.caller]) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
          pendingCandidatesRef.current[data.caller] = [];
        }
      } catch (err) {
        console.error("[answer] Error:", err);
      }
    });

    socket.on("ice-candidate", async (data) => {
      const pc = pcRef.current[data.caller];
      
      if (!pc) {
        console.warn(`[ice-candidate] No peer connection for ${data.caller}`);
        return;
      }

      // Queue if no remote description
      if (!pc.remoteDescription || pc.remoteDescription.type === "") {
        console.log(`[ice-candidate] Queuing for ${data.caller} (no remote description)`);
        if (!pendingCandidatesRef.current[data.caller]) {
          pendingCandidatesRef.current[data.caller] = [];
        }
        pendingCandidatesRef.current[data.caller].push(data.candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log(`[ice-candidate] Added for ${data.caller}`);
      } catch (err) {
        console.error(`[ice-candidate] Error:`, err);
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

    return () => {
      console.log("[cleanup] Cleaning up call component");

      socket.emit("leave-room", roomId);

      // Close all peer connections
      Object.values(pcRef.current).forEach((pc) => pc.close());
      pcRef.current = {};

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      // Stop screen stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      // Clean up audio analyzers
      Object.values(audioAnalyzersRef.current).forEach((analyzer) => {
        if (analyzer.ctx) analyzer.ctx.close();
        if (analyzer.interval) clearInterval(analyzer.interval);
      });
      audioAnalyzersRef.current = {};

      // Clear refs
      pendingCandidatesRef.current = {};
      isCreatingConnectionRef.current = {};
      remoteVideoRefs.current = {};

      // Remove socket listeners
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
  }, [roomId, username, navigate, user?.role, createPeerConnection, handlePeerDisconnect, startAudioDetection]);

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks();
    if (!tracks?.length) return;
    
    const newState = !audioEnabled;
    tracks[0].enabled = newState;
    setAudioEnabled(newState);
    console.log(`[toggleAudio] Audio ${newState ? 'enabled' : 'disabled'}`);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks();
    if (!tracks?.length) return;
    
    const newState = !videoEnabled;
    tracks[0].enabled = newState;
    setVideoEnabled(newState);
    console.log(`[toggleVideo] Video ${newState ? 'enabled' : 'disabled'}`);
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        console.log("[toggleScreenShare] Starting screen share");
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        screenStreamRef.current = screenStream;

        // Replace video track in all peer connections
        for (const [peerId, pc] of Object.entries(pcRef.current)) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(screenTrack);
            console.log(`[toggleScreenShare] Replaced track for ${peerId}`);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          console.log("[toggleScreenShare] Screen share ended by user");
          toggleScreenShare();
        };
        
        setScreenSharing(true);
      } catch (err) {
        console.error("[toggleScreenShare] Error:", err);
        alert("Could not start screen sharing.");
      }
    } else {
      console.log("[toggleScreenShare] Stopping screen share");
      const camTrack = localStreamRef.current?.getVideoTracks()[0];

      if (camTrack) {
        // Replace back to camera
        for (const [peerId, pc] of Object.entries(pcRef.current)) {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(camTrack);
            console.log(`[toggleScreenShare] Restored camera for ${peerId}`);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      setScreenSharing(false);
    }
  };

  const leaveCall = (isSilent = false) => {
    console.log("[leaveCall] Leaving call");
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
        <h1 className="text-3xl font-bold mb-4">📞 Call Ended</h1>
        <p className="text-lg text-gray-700">Returning to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-200 min-h-screen">
      {inCall ? (
        <div className="flex flex-col gap-6">
          <div className="text-center font-semibold text-lg bg-white/70 p-3 rounded-md shadow">
            👥 Users in room: {roomUsers.length > 0 ? roomUsers.join(", ") : "Connecting..."}
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
                    if (el) {
                      remoteVideoRefs.current[peerId] = el;
                      if (data.stream && el.srcObject !== data.stream) {
                        el.srcObject = data.stream;
                        console.log(`[render] Attached stream for ${peerId}`);
                      }
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

          <div className="border border-gray-400 rounded-md p-3 h-64 overflow-y-auto max-w-3xl mx-auto w-full bg-white">
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