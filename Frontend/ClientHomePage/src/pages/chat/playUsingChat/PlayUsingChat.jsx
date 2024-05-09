import { useState, useEffect } from "react";
import socketio from "socket.io-client";
import NotificationAlert from "../../../components/notificationAlert/NotificationAlert";

function PlayUsingChat() {
  const [gameSocket, setGameSocket] = useState(null);
  const [openGameInvitedModal, setOpenGameInvitedModal] = useState(false);
  const [chatActiveUser, setChatActiveUser] = useState(
    localStorage.getItem("userMarked")
  );

  const userName = localStorage.getItem("userName");
  const token = JSON.parse(localStorage.getItem("token"));
  const accessToken = token.accessToken;

  useEffect(() => {
    const newSocket = socketio("http://localhost:3003", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setGameSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const sendGameInviting = async (otherUser, e) => {
    console.log("Invited user:", otherUser);
    e.stopPropagation();
    setChatActiveUser(otherUser); // Update chatActiveUser with the invited user
    if (gameSocket) {
      gameSocket.emit("game-start", userName, otherUser);
    }
  };

  useEffect(() => {
    if (gameSocket) {
      gameSocket.emit("connection", () => {
        console.log("Connected to server");
      });
      gameSocket.emit("set_name", userName);
      gameSocket.on("game-invite", (otherUser) => {
        setOpenGameInvitedModal(true);
      });
      gameSocket.on("game_created", (newGame) => {
        console.log("Game created:", newGame);
        window.open(
          `http://localhost:5174/game/${userName}&${chatActiveUser}?token=${accessToken}`
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
  }, [gameSocket, userName, chatActiveUser, accessToken]);

  const closeGameInvited = () => {
    setOpenGameInvitedModal(false);
  };

  const handleAcceptGame = () => {
    console.log("Accept button clicked"); // Ensure the button click is registered
    window.open(
      `http://localhost:5174/game/${userName}&${chatActiveUser}?token=${accessToken}`
    );
    gameSocket.emit(
      "new_game",
      chatActiveUser,
      `http://localhost:5174/game/&${chatActiveUser}${userName}?token=${accessToken}`
    );
    setOpenGameInvitedModal(false);
  };

  return (
    <>
      {openGameInvitedModal && (
        <NotificationAlert
          otherUser={chatActiveUser}
          onClose={closeGameInvited}
          onAccept={handleAcceptGame}
          isGame={true}
          message={"Game Invited"}
        />
      )}
      <button
        data-bs-dismiss="chat-button"
        onClick={(e) => sendGameInviting(chatActiveUser, e)}
      >
        Request Game
      </button>
    </>
  );
}

export default PlayUsingChat;
