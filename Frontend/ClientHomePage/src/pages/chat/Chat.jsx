import React, { useEffect, useState } from "react";
import PlayUsingChat from "./playUsingChat/PlayUsingChat";
import io from "socket.io-client";
import NotificationAlert from "../../components/notificationAlert/NotificationAlert";
import "./Chat.css";

const chatSocket = io("http://localhost:3004");

const Chat = () => {
  const [userName, setUserName] = useState("");
  const [chatActiveUser, setChatActiveUser] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);
  const [openChatInvitedModal, setOpenChatInvitedModal] = useState(false);
  const [message, setMessage] = useState("");
  const storedUserName = localStorage.getItem("userName");
  const storedUserMarked = localStorage.getItem("userMarked");

  useEffect(() => {
    if (storedUserName && storedUserName.trim() !== "" && storedUserMarked) {
      chatSocket.on("connect", () => {
        console.log("Socket connected");
      });
      setUserName(storedUserName);
      setChatActiveUser(storedUserMarked);
      chatSocket.emit("set_name", storedUserName);
    } else {
      setError("Username not found in localStorage.");
    }
  }, [storedUserName, storedUserMarked]);

  const receiveMessageHandler = (message) => {
    console.log("Received message:", message);
    // Include the received message object directly
    const messageWithTimestamp = {
      ...message, // Keep all properties from the original message
      timestamp: message.timestamp,
    };
    setMessage(messageWithTimestamp);
    setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
    // Open the modal only if the received message is an invitation from another user
    if (message.senderName !== userName) {
      setOpenChatInvitedModal(true);
    }
  };

  useEffect(() => {
    chatSocket.on("message", receiveMessageHandler);

    return () => {
      chatSocket.off("message", receiveMessageHandler);
    };
  }, []);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      setError("Please enter a message.");
      return;
    }

    if (trimmedInput.length > 200) {
      setError("Message exceeds maximum length (200 characters).");
      return;
    }

    const msg = {
      senderName: userName,
      recipientName: chatActiveUser,
      text: inputValue,
      isGame: false,
    };

    chatSocket.emit("send-message", msg);
    setInputValue("");
  };

  useEffect(() => {
    setError(null);
  }, [inputValue]);

  return (
    <>
      {openChatInvitedModal && (
        <NotificationAlert
          otherUser={chatActiveUser}
          sender={message.senderName} // Pass sender's name
          onClose={null}
          onAccept={null}
          isGame={false}
          message={message.text}
        />
      )}
      <PlayUsingChat />
      <div className="web-chat">
        <div className="chat-window">
          <h2>Chat with {chatActiveUser}</h2>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.senderName === userName ? "my-message" : "other-message"
              }`}
            >
              <div className="message-bubble">
                {message.timestamp && (
                  <span className="timestamp">
                    {new Date(
                      `1970-01-01T${message.timestamp}`
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                  </span>
                )}
                <span className="username">{message.senderName}</span>:{" "}
                {/* Check if message.text exists before rendering */}
                {message.messageText && (
                  <span className="text">{message.messageText}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleMessageSubmit} className="message-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </>
  );
};

export default Chat;
