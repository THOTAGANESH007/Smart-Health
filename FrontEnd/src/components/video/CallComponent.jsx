import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const socket = io(`${import.meta.env.VITE_API_BASE_URL}`); //signaling server

const CallComponent = () => {
  const [roomId, setRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [username, setUsername] = useState("");
  const [speakingId, setSpeakingId] = useState(null);

  const localVideoRef = useRef();
  const remoteVideosRef = useRef({});
  const pcRef = useRef({});
  const localStreamRef = useRef();
  const screenStreamRef = useRef();
  const audioAnalyzersRef = useRef({});

  const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  const createRoom = () => {
    const id = uuidv4().substring(0, 8);
    setRoomId(id);
  };

  const joinRoom = async () => {
    if (!roomId.trim() || !username.trim())
      return alert("Enter Room ID and Name");
    setInCall(true);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 480, height: 360 },
      audio: true,
    });

    localVideoRef.current.srcObject = localStream;
    localStreamRef.current = localStream;

    startAudioDetection(localStream, username);

    socket.emit("join-room", { roomId, username });

    socket.on("user-joined", async (peerId, peerName) => {
      const pc = createPeerConnection(peerId, peerName);
      pcRef.current[peerId] = pc;
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { target: peerId, sdp: offer });
    });

    socket.on("offer", async (data) => {
      const { caller, sdp, name: callerName } = data;
      const pc = createPeerConnection(caller, callerName);
      pcRef.current[caller] = pc;
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: caller, sdp: answer });
    });

    socket.on("answer", async (data) => {
      const { caller, sdp } = data;
      if (pcRef.current[caller]) {
        await pcRef.current[caller].setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      }
    });

    socket.on("ice-candidate", async (data) => {
      const { caller, candidate } = data;
      if (pcRef.current[caller] && candidate) {
        try {
          await pcRef.current[caller].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (e) {
          console.error("Error adding ICE:", e);
        }
      }
    });

    socket.on("user-left", (peerId) => {
      if (pcRef.current[peerId]) pcRef.current[peerId].close();
      delete pcRef.current[peerId];

      if (remoteVideosRef.current[peerId]) {
        remoteVideosRef.current[peerId].container.remove();
        delete remoteVideosRef.current[peerId];
      }

      if (audioAnalyzersRef.current[peerId])
        delete audioAnalyzersRef.current[peerId];
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    });
  };

  const createPeerConnection = (peerId, peerName) => {
    const pc = new RTCPeerConnection(servers);

    pc.ontrack = (event) => {
      if (!remoteVideosRef.current[peerId]) {
        const container = document.createElement("div");
        container.className = "flex flex-col items-center";

        const videoEl = document.createElement("video");
        videoEl.autoplay = true;
        videoEl.playsInline = true;
        videoEl.width = 500;
        videoEl.height = 400;
        videoEl.className =
          "rounded-md border-4 border-gray-300 transition-all duration-200";
        videoEl.srcObject = event.streams[0];

        const label = document.createElement("div");
        label.className =
          "mt-2 font-semibold bg-blue-600 text-white px-2 rounded";
        label.innerText = peerName;

        container.appendChild(videoEl);
        container.appendChild(label);

        document.getElementById("remote-videos").appendChild(container);
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

  const startAudioDetection = (stream, id) => {
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    audioAnalyzersRef.current[id] = { analyser, dataArray, id, interval: null };

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (avg > 20) setSpeakingId(id);
    };

    const interval = setInterval(checkVolume, 200);
    audioAnalyzersRef.current[id].interval = interval;
  };

  const toggleAudio = () => {
    localStreamRef.current.getAudioTracks()[0].enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    localStreamRef.current.getVideoTracks()[0].enabled = !videoEnabled;
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
          const sender = pc.getSenders().find((s) => s.track.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });

        localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = () => toggleScreenShare();
        setScreenSharing(true);
      } catch (err) {
        console.error("Screen share error:", err);
      }
    } else {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      Object.values(pcRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track.kind === "video");
        if (sender) sender.replaceTrack(videoTrack);
      });
      localVideoRef.current.srcObject = localStreamRef.current;

      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
      }

      setScreenSharing(false);
    }
  };

  const leaveCall = () => {
    Object.values(pcRef.current).forEach((pc) => pc.close());
    pcRef.current = {};
    Object.values(remoteVideosRef.current).forEach((v) => v.container.remove());
    remoteVideosRef.current = {};
    Object.values(audioAnalyzersRef.current).forEach((v) =>
      clearInterval(v.interval)
    );
    audioAnalyzersRef.current = {};

    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    socket.emit("leave-room", roomId);
    setInCall(false);
    setRoomId("");
    setMessages([]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socket.emit("chat-message", { roomId, message: chatInput });
    setMessages((prev) => [...prev, `You: ${chatInput}`]);
    setChatInput("");
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-200 min-h-screen text-black">
      {!inCall && (
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-2">Join a Call</h1>
          <input
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
          <div className="flex gap-4">
            <button
              onClick={createRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Create Random Room
            </button>
            <button
              onClick={joinRoom}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Join Call
            </button>
          </div>
        </div>
      )}

      {inCall && (
        <div className="flex flex-col gap-6">
          <div
            className="flex flex-wrap justify-center gap-6"
            id="remote-videos"
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
                width={500}
                height={400}
              />
              <div className="mt-2 font-semibold bg-blue-600 text-white px-2 rounded">
                {username}
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
              onClick={leaveCall}
              className="px-3 py-2 bg-red-600 text-white rounded-md"
            >
              Leave Call
            </button>
          </div>

          <div className="flex gap-2 mt-4 max-w-3xl mx-auto">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="border px-3 py-2 rounded-md flex-1"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-blue-600 text-white rounded-md"
            >
              Send
            </button>
          </div>

          <div className="border border-gray-400 rounded-md p-3 h-64 overflow-y-scroll max-w-3xl mx-auto bg-white text-black">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm mb-1">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CallComponent;
