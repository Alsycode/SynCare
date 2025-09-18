import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { fetchData } from "../axiosInstance/index.jsx";
import { IoSend } from "react-icons/io5";

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

    socket.emit("join", { userId, room });
    socket.emit("join", { userId, room: userId });

    const fetchHistory = async () => {
      try {
        const data = await fetchData(`/api/chat/history/${doctorId}`);
        setMessages(data);
      } catch (err) {
        setError("Failed to fetch chat history");
      }
    };

    const markMessagesRead = async () => {
      try {
        await fetchData(`/api/chat/mark-read/${userId}`, { method: "POST" });
      } catch (err) {
        console.error("Failed to mark messages read:", err);
      }
    };

    fetchHistory();
    markMessagesRead();

    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [doctorId]);

  useEffect(() => {
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
        socket.emit("sendMessage", message);

        await fetchData("/api/chat/send", {
          method: "POST",
          data: message,
        });
      } catch (error) {
        setError("Failed to send message");
      }

      setInput("");
    }
  };

  return (
 <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-primary text-primary">
  <div className="w-full max-w-4xl p-8 rounded-3xl bg-card shadow-card flex flex-col h-[80vh] border border-primary transition-colors duration-300">
    <h2 className="text-3xl font-bold mb-6 text-center text-primary">
      Chat with Doctor
    </h2>

    {/* Chat window */}
    <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-secondary border border-primary shadow-inner mb-4">
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
                ? "bg-accent text-white"
                : "bg-card text-primary"
            }`}
          >
            {msg.message}
          </span>
        </div>
      ))}
    </div>

    {/* Input area */}
    <div className="flex">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 p-3 rounded-l-xl bg-card border border-primary text-primary placeholder-secondary focus:ring-2 focus:ring-accent focus:outline-none"
        placeholder="Type a message..."
      />
      <button
        onClick={sendMessage}
        className="bg-accent hover:bg-opacity-90 text-white px-6 py-3 rounded-r-xl transition-all flex items-center gap-1"
      >
        <IoSend className="text-lg" /> Send
      </button>
    </div>
  </div>
</div>

  );
}

export default Chat;
