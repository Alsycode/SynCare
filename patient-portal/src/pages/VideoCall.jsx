import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("https://syncare.onrender.com/", { transports: ["websocket"] });

const VideoCall = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);   // HTMLVideoElement | null
  const remoteVideoRef = useRef(null);  // HTMLVideoElement | null
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const isEndingRef = useRef(false);

  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [error, setError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // 0 .. 1

  // WebRTC initialization
  const initializeWebRTC = async () => {
    try {
      // Close old connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop old stream
      if (localStreamRef.current) {
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        await new Promise(r => setTimeout(r, 1000));
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = newStream;

      // Attach to local video
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;

      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      newStream.getTracks().forEach(track =>
        peerConnectionRef.current.addTrack(track, newStream)
      );

      peerConnectionRef.current.onicecandidate = e => {
        if (e.candidate) {
          socket.emit("ice-candidate", { room: roomId, candidate: e.candidate });
        }
      };

      peerConnectionRef.current.ontrack = e => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
          remoteVideoRef.current.volume = volume;
        }
      };

      return true;
    } catch (err) {
      setError("Camera / Mic error: " + err.message);
      return false;
    }
  };

  // Socket listeners
  useEffect(() => {
    socket.emit("join", { userId: localStorage.getItem("userId"), room: roomId });

    socket.on("connect", () => console.log("Socket connected"));
    socket.on("connect_error", () => setError("Server connection failed"));

    socket.on("call-made", ({ offer }) => setIncomingCall(offer));
    socket.on("call-answered", async ({ answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new window.RTCSessionDescription(answer)
        );
      }
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new window.RTCIceCandidate(candidate)
        );
      }
    });
    socket.on("call-ended", () => !isEndingRef.current && endCall());

    return () => {
      socket.off();
      if (isCalling || incomingCall) endCall();
    };
    // eslint-disable-next-line
  }, [roomId]);

  // Call helpers
  const startCall = async () => {
    if (!peerConnectionRef.current) await initializeWebRTC();
    setIsCalling(true);
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socket.emit("call-user", { room: roomId, offer });
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    if (!peerConnectionRef.current) await initializeWebRTC();

    await peerConnectionRef.current.setRemoteDescription(
      new window.RTCSessionDescription(incomingCall)
    );
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socket.emit("answer-call", { room: roomId, answer });

    setIncomingCall(null);
    setIsCalling(true);
  };

  const rejectCall = () => {
    setIncomingCall(null);
    socket.emit("end-call", { room: roomId });
  };

  const endCall = () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    setIsCalling(false);
    setIncomingCall(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    socket.emit("end-call", { room: roomId });

    setTimeout(() => (isEndingRef.current = false), 1000);
  };

  // Mute / Volume helpers
  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleVolumeChange = e => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (remoteVideoRef.current) remoteVideoRef.current.volume = vol;
  };

  // UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-primary p-4 transition-all duration-300">
      <div className="w-full max-w-5xl bg-card rounded-xl shadow-card p-6 relative border border-primary transition-all duration-300">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded bg-status-red text-white text-center">
            {error}
          </div>
        )}

        {/* Incoming call modal */}
        {incomingCall && !isCalling && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-primary rounded-lg p-6 shadow-card max-w-sm w-full border border-primary">
              <h3 className="text-xl font-bold text-status-blue mb-4">Incoming Call</h3>
              <div className="flex justify-center gap-4">
                <button
                  onClick={acceptCall}
                  className="bg-status-green text-white px-5 py-2 rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-status-red text-white px-5 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Videos */}
        <div className="relative flex flex-col md:flex-row gap-4">
          {/* Remote (big) */}
          <div className="flex-1 md:flex-[3] relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full rounded-lg border-2 border-primary object-cover bg-black"
            />
            <p className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              Remote
            </p>
          </div>
          {/* Local (small) */}
          <div className="flex-1 md:flex-1 relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg border-2 border-primary object-cover bg-black"
            />
            <p className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              You
            </p>
          </div>
        </div>

        {/* Control bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 bg-secondary rounded-lg border border-primary transition-all duration-300">
          {/* Start / End */}
          {!incomingCall && !isCalling && (
            <button
              onClick={startCall}
              className="bg-status-green text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Start Call
            </button>
          )}
          {isCalling && (
            <button
              onClick={endCall}
              className="bg-status-red text-white px-6 py-2 rounded-lg hover:bg-red-600"
            >
              End Call
            </button>
          )}

          {/* Mute */}
          {isCalling && (
            <button
              onClick={toggleMute}
              className={`px-4 py-2 rounded-lg transition ${
                isMuted ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {isMuted ? "Unmute" : "Mute"}
            </button>
          )}

          {/* Volume */}
          {isCalling && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-32 accent-blue-600"
              />
              <span className="text-xs w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
