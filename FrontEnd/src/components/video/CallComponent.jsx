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

  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});
  const pcRef = useRef({});
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const audioAnalyzersRef = useRef({});

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    if (!roomId || !username) return;

    const createPeerConnection = (peerId, peerName) => {
      const pc = new RTCPeerConnection(servers);
      pcRef.current[peerId] = pc;

      localStreamRef.current?.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });

      pc.ontrack = (event) => {
        if (!remoteVideosRef.current[peerId]) {
          const container = document.createElement("div");
          container.className = "flex flex-col items-center";

          const videoEl = document.createElement("video");
          videoEl.autoplay = true;
          videoEl.playsInline = true;
          videoEl.width = 400;
          videoEl.height = 300;
          videoEl.className =
            "rounded-md border-4 border-gray-300 transition-all duration-200";
          videoEl.srcObject = event.streams[0];

          const label = document.createElement("div");
          label.className =
            "mt-2 font-semibold bg-blue-600 text-white px-2 rounded";
          label.innerText = peerName;

          container.appendChild(videoEl);
          container.appendChild(label);
          document.getElementById("remote-videos")?.appendChild(container);

          remoteVideosRef.current[peerId] = { videoEl, label, container };
          startAudioDetection(event.streams[0], peerId);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            target: peerId,
            candidate: event.candidate,
          });
        }
      };
      return pc;
    };

    const joinRoom = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360 },
          audio: true,
        });
        if (localVideoRef.current)
          localVideoRef.current.srcObject = localStream;
        localStreamRef.current = localStream;
        startAudioDetection(localStream, username);
        setInCall(true);
        socket.emit("join-room", { roomId, username });
      } catch (err) {
        console.error("Failed to get local stream", err);
        alert(
          "Could not access camera or microphone. Please check permissions."
        );
        navigate(user?.role === "DOCTOR" ? "/doctor" : "/patient");
      }
    };
    joinRoom();

    // FIX: This new listener correctly populates the user list from the server
    socket.on("update-user-list", (users) => {
      setRoomUsers(users);
    });

    socket.on("existing-users", async (users) => {
      for (const u of users) {
        const pc = createPeerConnection(u.id, u.username);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: u.id, sdp: offer });
      }
    });

    // FIX: Correctly destructure the object payload for user-joined event
    socket.on("user-joined", ({ peerId, peerName }) => {
      // The new joiner will send us an offer, so we create the PC when the offer arrives.
      console.log(`${peerName} has joined the call.`);
    });

    // FIX: Correctly destructure the object payload for user-left event
    socket.on("user-left", ({ peerId }) => {
      if (pcRef.current[peerId]) {
        pcRef.current[peerId].close();
        delete pcRef.current[peerId];
      }
      if (remoteVideosRef.current[peerId]) {
        remoteVideosRef.current[peerId].container.remove();
        delete remoteVideosRef.current[peerId];
      }
      if (audioAnalyzersRef.current[peerId]) {
        clearInterval(audioAnalyzersRef.current[peerId].interval);
        delete audioAnalyzersRef.current[peerId];
      }
    });

    socket.on("offer", async (data) => {
      const { caller, sdp, name: callerName } = data;
      const pc = createPeerConnection(caller, callerName);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: caller, sdp: answer });
    });

    socket.on("answer", async (data) => {
      await pcRef.current[data.caller]?.setRemoteDescription(
        new RTCSessionDescription(data.sdp)
      );
    });

    socket.on("ice-candidate", async (data) => {
      await pcRef.current[data.caller]?.addIceCandidate(
        new RTCIceCandidate(data.candidate)
      );
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    });

    // FIX: Handle rejection/offline status here, after navigating to the call screen
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
      socket.emit("leave-room", roomId);
      Object.values(pcRef.current).forEach((pc) => pc.close());
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      Object.values(audioAnalyzersRef.current).forEach((analyzer) =>
        clearInterval(analyzer.interval)
      );
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

  // --- Your Original Control Functions & JSX (Unchanged) ---

  const startAudioDetection = (stream, id) => {
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (avg > 20) setSpeakingId(id);
      };
      const interval = setInterval(checkVolume, 200);
      audioAnalyzersRef.current[id] = { analyser, dataArray, id, interval };
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
    }, 3000);
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
          <div
            id="remote-videos"
            className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 justify-center"
          >
            <div className="flex flex-col items-center">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`rounded-md border-4 transition-all duration-200 ${
                  speakingId === username
                    ? "border-yellow-400 scale-105"
                    : "border-gray-300"
                }`}
                width={400}
                height={300}
              />
              <div className="mt-2 font-semibold bg-blue-600 text-white px-2 rounded">
                {username} (You)
              </div>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={toggleAudio}
              className="px-3 py-2 bg-gray-700 text-white rounded-md"
            >
              {audioEnabled ? "Mute" : "Unmute"}
            </button>
            <button
              onClick={toggleVideo}
              className="px-3 py-2 bg-gray-700 text-white rounded-md"
            >
              {videoEnabled ? "Stop Video" : "Start Video"}
            </button>
            <button
              onClick={toggleScreenShare}
              className="px-3 py-2 bg-indigo-600 text-white rounded-md"
            >
              {screenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
            <button
              onClick={() => leaveCall()}
              className="px-3 py-2 bg-red-600 text-white rounded-md"
            >
              Leave Call
            </button>
          </div>
          <div className="flex gap-2 mt-4 max-w-3xl mx-auto w-full">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="border px-3 py-3 rounded-md flex-1 text-base h-20 resize-none"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-blue-600 text-white rounded-md h-fit"
            >
              Send
            </button>
          </div>
          <div className="border border-gray-400 rounded-md p-3 h-64 overflow-y-scroll max-w-3xl mx-auto w-full bg-white text-black">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm mb-1">
                {msg}
              </div>
            ))}
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
