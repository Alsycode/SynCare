import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

const socket = io("https://syncare.onrender.com/", { withCredentials: true });

function Chat() {
  const { patientId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    // Mark messages of patient as read via API using fetchData utility
    const markMessagesRead = async () => {
      try {
        await fetchData(`/api/chat/mark-read/${patientId}`, {
          method: "POST",
          data: null,
        });
        console.log(`Messages marked as read for patientId: ${patientId}`);
      } catch (err) {
        console.error("Failed to mark messages read:", err);
      }
    };
    markMessagesRead();
  }, [patientId]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const room = `${patientId}-${userId}`;

    // Join rooms
    socket.emit("join", { userId, room });
    socket.emit("join", { userId, room: userId });
    console.log(`Doctor ${userId} joined rooms: ${room}, ${userId}`);

    // Fetch chat history via fetchData utility
    const fetchHistory = async () => {
      try {
        const data = await fetchData(`/api/chat/history/${patientId}`);
        setMessages(data);
        console.log("Chat history fetched:", data);
      } catch (err) {
        setError("Failed to fetch chat history");
        console.error("Error fetching chat history:", err);
      }
    };
    fetchHistory();

    // Socket listener for incoming messages
    const messageListener = (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]);
    };

    socket.on("message", messageListener);

    // Cleanup on unmount
    return () => {
      socket.off("message", messageListener);
    };
  }, [patientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim()) {
      const userId = localStorage.getItem("userId");
      const message = {
        room: `${patientId}-${userId}`,
        message: input,
        sender: "doctor",
        patientId,
        doctorId: userId,
      };

      try {
        socket.emit("sendMessage", message);
        console.log("Message sent via Socket.IO:", message);
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
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 rounded-bl-[50px] rounded-tl-[50px] ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div className="w-full max-w-2xl p-8 sm:p-10 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200 text-center">
          Chat with Patient
        </h2>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/70 text-center text-white">
            {error}
          </div>
        )}
        <div className="h-96 overflow-y-auto flex flex-col gap-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg mb-6">
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No messages yet
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "doctor" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`max-w-xs break-words px-4 py-2 rounded-2xl text-white shadow-lg ${
                    msg.sender === "doctor"
                      ? "bg-purple-500/80"
                      : "bg-teal-500/70"
                  }`}
                >
                  {msg.message}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-l-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-purple-500/90 hover:bg-purple-500 text-white px-6 py-2 rounded-r-lg transition-all duration-300 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
