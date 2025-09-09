import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { fetchData } from "../axiosInstance/index.jsx"; // Adjust the import path accordingly
import { IoSend } from "react-icons/io5"; // icon for send button

const socket = io("http://localhost:5000", { withCredentials: true });

function Chat() {
  const { doctorId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const room = `${userId}-${doctorId}`;

    // Join both the chat room and patient's own room
    socket.emit("join", { userId, room });
    socket.emit("join", { userId, room: userId });
    console.log(`Patient ${userId} joined rooms: ${room}, ${userId}`);

    const fetchHistory = async () => {
      try {
        const data = await fetchData(`/api/chat/history/${doctorId}`);
        setMessages(data);
        console.log("Chat history fetched:", data);
      } catch (err) {
        setError("Failed to fetch chat history");
        console.error("Error fetching chat history:", err);
      }
    };

    const markMessagesRead = async () => {
      try {
        await fetchData(`/api/chat/mark-read/${userId}`, { method: "POST" });
        console.log(`Messages marked as read for patientId: ${userId}`);
      } catch (err) {
        console.error("Failed to mark messages read:", err);
      }
    };

    fetchHistory();
    markMessagesRead();

    const handleMessage = (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [doctorId]);

  useEffect(() => {
    // Auto scroll to bottom when a new message appears
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
      const userId = localStorage.getItem("userId");
      const message = {
        room: `${userId}-${doctorId}`,
        message: input,
        sender: "patient",
        patientId: userId,
        doctorId,
      };

      try {
        // Send via Socket.IO
        socket.emit("sendMessage", message);
        console.log("Message sent via Socket.IO:", message);

        // Fallback: Send via HTTP to ensure message is saved
        await fetchData("/api/chat/send", {
          method: "POST",
          data: message,
        });
        console.log("Message sent via HTTP:", message);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message");
      }

      setInput("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="w-full max-w-4xl p-8 rounded-3xl bg-white shadow-2xl flex flex-col h-[80vh]">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          Chat with Doctor
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500 text-white text-center">
            {error}
          </div>
        )}

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-gray-50 border border-gray-200 shadow-inner mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 flex ${
                msg.sender === "patient" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-2xl max-w-xs break-words shadow-sm ${
                  msg.sender === "patient"
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                {msg.message}
              </span>
            </div>
          ))}

          {messages.length === 0 && !error && (
            <p className="text-gray-500 text-center">No messages yet</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 p-3 rounded-l-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-r-xl transition-all flex items-center gap-1"
          >
            <IoSend className="text-lg" /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
