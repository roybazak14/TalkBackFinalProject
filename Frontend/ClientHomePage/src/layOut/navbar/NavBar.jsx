import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Nav, Navbar, Stack, Dropdown } from "react-bootstrap";
import socketio from "socket.io-client";
import { Link } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const authMicroServiceIp = "https://localhost:7208/api/auth";
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [gameSocket, setGameSocket] = useState(null);
  const [openGameInvitedModal, setOpenGameInvitedModal] = useState(false);
  const [storeAccessToken, setStoreAccessToken] = useState("");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserMarked = localStorage.getItem("userMarked");
    const tokenString = localStorage.getItem("token");
    const accessToken = tokenString
      ? JSON.parse(tokenString).accessToken
      : null;

    // Set user name
    if (storedUserName) {
      setUserName(storedUserName);
    }

    // Set selected user
    if (storedUserMarked) {
      setSelectedUser(storedUserMarked);
    }

    // Set access token
    if (accessToken) {
      setStoreAccessToken(accessToken);
    }
  }, []);

  useEffect(() => {
    const newSocket = socketio("http://localhost:3003", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setGameSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const sendGameInviting = async (otherUser, e) => {
    if (!selectedUser || selectedUser === "null" || selectedUser === "") {
      // Check for null, undefined, or empty string
      alert("Please select a user to invite");
      return;
    }

    if (gameSocket) {
      e.stopPropagation();
      console.log("Invited user:", otherUser);
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
          `http://localhost:5174/game/${userName}&${selectedUser}?token=${storeAccessToken}`
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
  }, [gameSocket, userName, selectedUser, storeAccessToken]);

  const closeGameInvited = () => {
    setOpenGameInvitedModal(false);
    gameSocket.emit("invite-declined", selectedUser, userName);
  };

  const handleAcceptGame = () => {
    console.log("Accept button clicked");
    gameSocket.emit("invite-accepted", selectedUser, userName);
    window.open(
      `http://localhost:5174/game/${userName}&${selectedUser}?token=${storeAccessToken}`
    );
    gameSocket.emit(
      "new_game",
      selectedUser,
      `http://localhost:5174/game/&${selectedUser}${userName}?token=${storeAccessToken}`
    );
    setOpenGameInvitedModal(false);
  };

  useEffect(() => {
    const refreshAccessToken = async () => {
      try {
        const tokenString = localStorage.getItem("token");

        if (!tokenString) {
          navigate("/");
          return;
        }

        const token = JSON.parse(tokenString);

        const response = await axios.post(authMicroServiceIp + "/refresh", {
          refreshToken: token.refreshToken,
        });

        const newToken = response.data;

        if (!newToken || !newToken.accessToken) {
          localStorage.clear();
          navigate("/");
          return;
        }

        localStorage.setItem("token", JSON.stringify(newToken));
      } catch (err) {
        console.log("Error refreshing token:", err);
        localStorage.clear();
        navigate("/");
      }
    };

    if (userName) {
      refreshAccessToken();
    }
  }, [userName, navigate]);

  const handleLogout = async () => {
    localStorage.clear();
    await removeUserFromOnlineList();
    window.location.reload();
  };

  const handleChat = (user) => {
    if (!user || user === "null" || user === "") {
      alert("Please select a user to chat");
      return;
    } else {
      setSelectedUser(user);
      window.open(`http://localhost:5173/chat/${user}`);
    }
  };

  const removeUserFromOnlineList = async () => {
    try {
      const response = await axios.post(authMicroServiceIp + "/logout");
      if (response.status === 204) {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error removing user from online list:", error);
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
          message="Game Invited"
        />
      )}
      <Navbar bg="dark" className="mb-4" style={{ height: "5rem" }}>
        <Container className="d-flex justify-content-between align-items-center">
          <Nav className="me-auto">
            <h2 className="mb-0" id="back">
              <img
                src="https://store-images.s-microsoft.com/image/apps.24360.9007199266251823.8de22c18-6ea5-4a03-a136-cb2184d56025.940f7423-8780-44f8-9d2f-7d0ad0d1af2d?mode=scale&q=90&h=1080&w=1920"
                alt="Backgammon"
                width="80"
                height="70"
              />
              <Link to="/menu" className="link-light text-decoration-none">
                TalkBack
              </Link>
            </h2>
          </Nav>
          <Nav id="user" className="ms-auto d-flex align-items-center">
            <Stack direction="horizontal" gap={8}>
              {userName && (
                <span className="text-warning logged-in-user">
                  Hello, {userName}
                </span>
              )}
              {userName ? (
                <Link to="/" className="btn btn-danger" onClick={handleLogout}>
                  Log Out
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary">
                  Log In
                </Link>
              )}
              {!userName && (
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              )}
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  <span className="visually-hidden">Toggle Dropdown</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {!userName && (
                    <Dropdown.Item as={Link} to="/login">
                      Connect
                    </Dropdown.Item>
                  )}
                  {userName && (
                    <Dropdown.Item onClick={handleLogout}>
                      Disconnect
                    </Dropdown.Item>
                  )}
                  {userName && (
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleChat(selectedUser)}>
                        Chat
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={(e) => sendGameInviting(selectedUser, e)}
                      >
                        Play
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  )}

                  <Dropdown.Item
                    as={Link}
                    to="https://www.youtube.com/watch?v=KDvvKWi0ijs"
                  >
                    How to Play
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => navigate("/about")}>
                    About
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Stack>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default NavBar;
