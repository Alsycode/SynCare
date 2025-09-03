import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

function VideoCall() {
  const { roomId } = useParams();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [error, setError] = useState('');

  // Function to initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      // Create new RTCPeerConnection
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log('Local stream acquired:', stream);
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach(track => {
        console.log('Adding track:', track);
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate);
          socket.emit('ice-candidate', { room: roomId, candidate: event.candidate });
        }
      };

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Remote stream received:', event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      // Monitor connection state
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === 'failed') {
          setError('Connection failed. Please try again.');
          endCall();
        }
      };

      return true;
    } catch (err) {
      console.error('WebRTC initialization error:', err);
      setError('Failed to initialize video call. Ensure camera/microphone permissions are granted.');
      return false;
    }
  };

  useEffect(() => {
    console.log('VideoCall mounted, roomId:', roomId);

    // Join Socket.IO room
    socket.emit('join', { userId: localStorage.getItem('userId'), room: roomId });
    console.log('Joined room:', roomId);

    // Socket.IO event listeners
    socket.on('connect', () => console.log('Socket.IO connected'));
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      setError('Failed to connect to server. Please check your network.');
    });

    socket.on('call-made', ({ offer }) => {
      console.log('Received incoming call offer:', offer);
      setIncomingCall(offer);
    });

    socket.on('call-answered', async ({ answer }) => {
      console.log('Received answer:', answer);
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error setting remote answer:', err);
        setError('Failed to process call answer.');
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        console.log('Received ICE candidate:', candidate);
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    socket.on('call-ended', () => {
      console.log('Call ended by remote user');
      endCall();
    });

    // Initialize WebRTC on mount
    initializeWebRTC();

    return () => {
      console.log('Cleaning up VideoCall');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('call-made');
      socket.off('call-answered');
      socket.off('ice-candidate');
      socket.off('call-ended');
      endCall(); // Clean up on component unmount
    };
  }, [roomId]);

  const startCall = async () => {
    try {
      // Reinitialize WebRTC if peer connection is null or closed
      if (!peerConnectionRef.current || peerConnectionRef.current.connectionState === 'closed') {
        const initialized = await initializeWebRTC();
        if (!initialized) {
          throw new Error('Failed to reinitialize WebRTC');
        }
      }

      setIsCalling(true);
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('Sending offer:', offer);
      socket.emit('call-user', { room: roomId, offer });
    } catch (err) {
      console.error('Error starting call:', err);
      setError('Failed to start call.');
      setIsCalling(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      // Reinitialize WebRTC if necessary
      if (!peerConnectionRef.current || peerConnectionRef.current.connectionState === 'closed') {
        const initialized = await initializeWebRTC();
        if (!initialized) {
          throw new Error('Failed to reinitialize WebRTC');
        }
      }

      console.log('Accepting call with offer:', incomingCall);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCall));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('Sending answer:', answer);
      socket.emit('answer-call', { room: roomId, answer });
      setIncomingCall(null);
      setIsCalling(true);
    } catch (err) {
      console.error('Error accepting call:', err);
      setError('Failed to accept call.');
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    console.log('Rejecting call');
    setIncomingCall(null);
    socket.emit('end-call', { room: roomId });
  };

  const endCall = () => {
    console.log('Ending call');
    setIsCalling(false);
    setIncomingCall(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null; // Clear the video element
    }
    socket.emit('end-call', { room: roomId });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Video Call</h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/70 text-white text-center">
            {error}
          </div>
        )}
        {incomingCall && !isCalling && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full">
              <h3 className="text-xl font-bold text-blue-600 mb-4">Incoming Call</h3>
              <p className="text-gray-700 mb-6">You have an incoming video call. Accept to start the call.</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={acceptCall}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Accept Call
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject Call
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
              className="w-full rounded-lg border-2 border-gray-300"
            />
            <p className="text-center mt-2">You</p>
          </div>
          <div className="flex-1">
            <video
              ref={remoteVideoRef}
              autoPlay
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