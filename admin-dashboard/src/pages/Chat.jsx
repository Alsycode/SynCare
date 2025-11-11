import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { ThemeContext } from "../context/ThemeContext";
import { fetchData } from "../axiosInstance/index";

// Socket connection to the server
const socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });


/**
 * Chat component allows doctors to communicate with patients through real-time messaging.
 * It supports fetching chat history, marking messages as read, and sending new messages.
 */
const Chat = () => {
  const { patientId } = useParams(); // Fetches the patient ID from the URL
  const [messages, setMessages] = useState([]); // Stores chat messages
  const [input, setInput] = useState(""); // Stores the current input from the user
  const [error, setError] = useState(""); // Stores error messages
  const messagesEndRef = useRef(null); // Ref to automatically scroll to the latest message
  const { theme } = useContext(ThemeContext); // Accesses the current theme (light or dark)

  /**
   * Marks messages as read when the component is first mounted.
   */
  useEffect(() => {
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
    markMessagesRead(); // Mark messages as read
  }, [patientId]);

  /**
   * Joins the appropriate socket room and fetches the chat history when the component mounts.
   * Also listens for incoming messages and updates the message list.
   */
  useEffect(() => {
    const userId = localStorage.getItem("userId"); // Get the logged-in user's ID
    const room = `${patientId}-${userId}`; // Room is based on patientId and userId

    // Join the chat room
    socket.emit("join", { userId, room });
    socket.emit("join", { userId, room: userId }); // Also join a room for the doctor themselves
    console.log(`Doctor ${userId} joined rooms: ${room}, ${userId}`);

    // Fetch chat history from the server
    const fetchHistory = async () => {
      try {
        const data = await fetchData(`/api/chat/history/${patientId}`);
        setMessages(data); // Update the message state with the fetched history
        console.log("Chat history fetched:", data);
      } catch (err) {
        setError("Failed to fetch chat history"); // Handle errors
        console.error("Error fetching chat history:", err);
      }
    };
    fetchHistory();

    // Socket listener for incoming messages
    const messageListener = (message) => {
      console.log("Received message:", message);
      setMessages((prev) => [...prev, message]); // Update state with the new message
    };

    // Set up listener for incoming messages
    socket.on("message", messageListener);

    // Cleanup on unmount
    return () => {
      socket.off("message", messageListener); // Remove the listener when the component unmounts
    };
  }, [patientId]);

  /**
   * Scrolls the message container to the bottom each time a new message is received or sent.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scrolls to the latest message
  }, [messages]);

  /**
   * Sends a new message to the server via Socket.IO and HTTP.
   */
  const sendMessage = async () => {
    if (input.trim()) {
      const userId = localStorage.getItem("userId"); // Get the logged-in user's ID
      const message = {
        room: `${patientId}-${userId}`, // Message room for this chat
        message: input, // The message content
        sender: "doctor", // Sender is always the doctor in this case
        patientId,
        doctorId: userId,
      };

      try {
        // Send the message through Socket.IO
        socket.emit("sendMessage", message);
        console.log("Message sent via Socket.IO:", message);

        // Also send the message through HTTP to the server for persistence
        await fetchData("/api/chat/send", {
          method: "POST",
          data: message,
        });
        console.log("Message sent via HTTP:", message);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message"); // Handle errors
      }

      setInput(""); // Reset the input field after sending the message
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/70 text-center text-white">
            {error}
          </div>
        )}

        {/* Message Display */}
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

        {/* Input Field and Send Button */}
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-l-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage(); // Allow sending message with Enter key
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
};

export default Chat;
