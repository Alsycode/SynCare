import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("https://syncare.onrender.com/", { transports: ["websocket"] });

const VideoCall = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const isEndingRef = useRef(false); // 🔹 Guard to prevent multiple endCall executions

  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [error, setError] = useState("");

  // --- WebRTC Initialization ---
  const initializeWebRTC = async () => {
    try {
      // Close any old connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // 🔹 Stop and clear old stream before requesting new
      if (localStreamRef.current) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;

        // 🔹 Add delay to allow device full release
        console.log("Stopping old stream... waiting 1s for device release.");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Request new stream
      console.log("Requesting new media stream...");
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = newStream;

      // 🔹 Debug logs
      const videoTrack = newStream.getVideoTracks()[0];
      console.log("New stream acquired:", newStream);
      console.log("Video track:", videoTrack);
      console.log("Track readyState:", videoTrack?.readyState); // Should be 'live'
      console.log("Track enabled:", videoTrack?.enabled); // Should be true
      if (videoTrack?.readyState !== 'live') {
        throw new Error("Video track is not live – check device release.");
      }

      // Create fresh peer connection
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Attach local video
      localVideoRef.current.srcObject = newStream;

      // Add local tracks
      newStream.getTracks().forEach(track =>
        peerConnectionRef.current.addTrack(track, newStream)
      );

      // ICE candidate handling
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { room: roomId, candidate: event.candidate });
        }
      };

      // Remote stream handling
      peerConnectionRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      console.log("WebRTC initialized successfully.");
      return true;
    } catch (err) {
      console.error("Media error:", err);
      setError("Could not access camera/microphone: " + err.message);
      return false;
    }
  };

  // --- Socket setup ---
  useEffect(() => {
    socket.emit("join", { userId: localStorage.getItem("userId"), room: roomId });

    socket.on("connect", () => console.log("Socket.IO connected"));
    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      setError("Failed to connect to server. Please check your network.");
    });

    socket.on("call-made", ({ offer }) => {
      setIncomingCall(offer);
    });

    socket.on("call-answered", async ({ answer }) => {
      try {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error setting remote answer:", err);
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    });

    socket.on("call-ended", () => {
      console.log("Received call-ended event from server.");
      if (!isEndingRef.current) {
        endCall();
      }
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("call-made");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
      // Only call endCall if a call is active
      if (isCalling || incomingCall) {
        console.log("Cleanup: Ending call due to unmount or roomId change.");
        endCall();
      }
    };
  }, [roomId]);

  // --- Call controls ---
  const startCall = async () => {
    try {
      if (!peerConnectionRef.current || peerConnectionRef.current.connectionState === "closed") {
        const initialized = await initializeWebRTC();
        if (!initialized) return;
      }

      setIsCalling(true);
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("call-user", { room: roomId, offer });
    } catch (err) {
      console.error("Error starting call:", err);
      setError("Failed to start call.");
      setIsCalling(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      if (!peerConnectionRef.current || peerConnectionRef.current.connectionState === "closed") {
        const initialized = await initializeWebRTC();
        if (!initialized) return;
      }

      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCall));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      socket.emit("answer-call", { room: roomId, answer });

      setIncomingCall(null);
      setIsCalling(true);
    } catch (err) {
      console.error("Error accepting call:", err);
      setError("Failed to accept call.");
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    socket.emit("end-call", { room: roomId });
  };

  const endCall = () => {
    if (isEndingRef.current) {
      console.log("endCall already in progress, skipping.");
      return;
    }
    isEndingRef.current = true;
    console.log("Ending call...");

    setIsCalling(false);
    setIncomingCall(null);

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear video elements first to detach streams
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Stop local stream tracks safely (after detaching)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    socket.emit("end-call", { room: roomId });
    console.log("Call ended – device should be released.");

    // Reset guard after a short delay to allow event propagation
    setTimeout(() => {
      isEndingRef.current = false;
    }, 1000);
  };

  // --- UI ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Video Call</h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/70 text-white text-center">{error}</div>
        )}

        {incomingCall && !isCalling && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
              <h3 className="text-xl font-bold text-blue-600 mb-4">Incoming Call</h3>
              <p className="text-gray-700 mb-6">
                You have an incoming video call. Accept to start the call.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={acceptCall}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-lg border-2 border-gray-300"
            />
            <p className="text-center mt-2">You</p>
          </div>
          <div className="flex-1">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-2 border-gray-300"
            />
            <p className="text-center mt-2">Remote</p>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {!incomingCall && !isCalling && (
            <button
              onClick={startCall}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Start Call
            </button>
          )}
          {isCalling && (
            <button
              onClick={endCall}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCall;