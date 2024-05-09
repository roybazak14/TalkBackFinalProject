import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import UserListGeneral from "../../components/users/UsersListGeneral";
import socketio from "socket.io-client";
import "./MainMenu.css";
import NotificationAlert from "../../components/notificationAlert/NotificationAlert";

const MainMenu = () => {
  const [userName, setUserName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [users, setUsers] = useState([]);
  const [gameSocket, setGameSocket] = useState("");
  const [openGameInvitedModal, setOpenGameInvitedModal] = useState(false);

  useEffect(() => {
    const accessToken = JSON.parse(localStorage.getItem("token")).accessToken;
    const storedUserName = localStorage.getItem("userName");
    storedUserName && setUserName(storedUserName);
    const storedUserMarked = localStorage.getItem("userMarked");
    storedUserMarked && setSelectedUser(storedUserMarked);
    accessToken && setAccessToken(accessToken);
  }, []);

  useEffect(() => {
    const newSocket = socketio("http://localhost:3003", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setGameSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const sendGameInviting = (otherUser, e) => {
    if (otherUser == "null" || otherUser == "" || otherUser == null) {
      alert("Please select a user to invite");
    }
    console.log("Invited user:", otherUser);
    e.stopPropagation();
    setSelectedUser(otherUser);
    if (gameSocket) {
      gameSocket.emit("game-start", userName, otherUser);
    }
  };

  useEffect(() => {
    if (gameSocket) {
      console.log("Chat active user:", selectedUser);
      gameSocket.emit("connection", () => {
        console.log("Connected to server");
      });
      gameSocket.emit("set_name", userName);
      gameSocket.on("game-invite", (otherUser) => {
        setSelectedUser(otherUser);
        setOpenGameInvitedModal(true);
      });
      gameSocket.on("game_created", (newGame) => {
        console.log("Game created:", newGame);
        window.open(
          `http://localhost:5174/game/${userName}&${selectedUser}?token=${accessToken}`
        );
      });
      gameSocket.on("cancel-invite", () => {
        setOpenGameInvitedModal(false);
      });

      return () => {
        gameSocket.off("game_created");
        gameSocket.off("game-invite");
        gameSocket.off("cancel-invite");
      };
    }
  }, [gameSocket, userName, selectedUser, accessToken]);

  const closeGameInvited = () => {
    setOpenGameInvitedModal(false);
    gameSocket.emit("invite-declined", selectedUser, userName);
  };

  const handleAcceptGame = () => {
    console.log("Accept button clicked");
    gameSocket.emit("invite-accepted", selectedUser, userName);
    window.open(
      `http://localhost:5174/game/${userName}&${selectedUser}?token=${accessToken}`
    );
    gameSocket.emit(
      "new_game",
      selectedUser,
      `http://localhost:5174/game/&${selectedUser}${userName}?token=${accessToken}`
    );
    setOpenGameInvitedModal(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleChat = (user) => {
    if (user) {
      setSelectedUser(user);
      window.open(`http://localhost:5173/chat/${user}`);
    } else {
      alert("Please select a user to chat");
    }
  };

  return (
    <>
      {openGameInvitedModal && (
        <NotificationAlert
          otherUser={selectedUser}
          onClose={closeGameInvited}
          onAccept={handleAcceptGame}
          isGame={true}
          message={"Game Invited"}
        />
      )}
      <div className="container">
        <h1 className="title">Welcome, {userName}!</h1>
        <div className="menu">
          <Button
            variant="primary"
            onClick={(e) => sendGameInviting(selectedUser, e)}
            id="backgammon"
          >
            Play Backgammon
          </Button>
          <Button
            variant="primary"
            onClick={() => handleChat(selectedUser)}
            id="chat"
          >
            Chat
          </Button>
          <Button variant="primary" onClick={handleLogout} id="logout">
            Logout
          </Button>
        </div>
        <UserListGeneral
          users={users}
          onSelectUser={(user) => setSelectedUser(user)}
        />
      </div>
    </>
  );
};

export default MainMenu;
