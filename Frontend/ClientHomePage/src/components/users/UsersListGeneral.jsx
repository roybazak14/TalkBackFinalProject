import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./UsersListGeneral.css";

const UserListGeneral = ({ onSelectUser }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [offlineUsers, setOfflineUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(
    localStorage.getItem("userMarked") || null
  );
  const onlineUserMicroService = "http://localhost:3001";
  const AuthenticationService = "https://localhost:7208";
  const userName = localStorage.getItem("userName");
  const socketRef = useRef();

  // Clear userMarked when component mounts
  useEffect(() => {
    localStorage.removeItem("userMarked");
  }, []);

  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const response = await axios.get(
          onlineUserMicroService + "/online-users"
        );
        setOnlineUsers(response.data.filter((user) => user !== userName));
        setError(null);
      } catch (error) {
        console.error("Error fetching online users:", error.message);
        setError("Error fetching online users. Please try again later.");
      }
    };

    const fetchOfflineUsers = async () => {
      try {
        const allUsersResponse = await axios.get(
          AuthenticationService + "/api/auth/all-users"
        );
        const allUsers = allUsersResponse.data;

        const onlineUsersResponse = await axios.get(
          onlineUserMicroService + "/online-users"
        );
        const onlineUsers = onlineUsersResponse.data;

        const offlineUsers = allUsers.filter(
          (user) => !onlineUsers.includes(user.userName)
        );

        setOfflineUsers(offlineUsers);
        setError(null);
      } catch (error) {
        console.error("Error fetching offline users:", error);
        setError("Error fetching offline users. Please try again later.");
      }
    };

    const socket = io("http://localhost:3001");

    socket.emit("user-logged-in", userName);

    socket.on("updateOnlineUsers", (updatedOnlineUsers) => {
      const uniqueUsers = updatedOnlineUsers.filter(
        (user) => user !== userName
      );
      setOnlineUsers(uniqueUsers);
      setError(null);
    });

    socket.on("connect_error", (err) => {
      setError("Connection error. Please try again later.");
    });

    socketRef.current = socket;
    fetchOfflineUsers();
    fetchOnlineUsers();
    return () => {
      socketRef.current.disconnect();
    };
  }, [userName]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    onSelectUser(user); // Pass selected user back to the MainMenu component
    localStorage.setItem("userMarked", user); // Update localStorage
  };

  const handleUserDoubleClick = (user) => {
    window.open(`http://localhost:5173/chat/${user}`);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list">
        <h2 className="users-title-online">Online Users</h2>
        <div className="users-queue">
          {onlineUsers.map((user, index) => (
            <button
              className={`user-card ${selectedUser === user ? "selected" : ""}`}
              key={index}
              onClick={() => handleUserClick(user)}
              onDoubleClick={() => handleUserDoubleClick(user)}
              style={{
                backgroundColor: "white",
              }}
            >
              {user}
            </button>
          ))}
        </div>
      </div>
      <div className="user-list">
        <h2 className="users-title-offline">Offline Users</h2>
        <div className="users-container">
          {offlineUsers.map((user, index) => (
            <div className="offline-user" key={index}>
              {user.userName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserListGeneral;
