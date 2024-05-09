import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Row, Alert, Form, Col, Stack } from "react-bootstrap";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

const LogIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(""); // State to hold username

  useEffect(() => {
    const storedUsername = localStorage.getItem("userName");
    if (storedUsername) {
      setUsername(storedUsername); // If yes, set it to the state
    }
  }, []);

  const authenticationBaseURL = "https://localhost:7208";
  const onlineUserMicroService = "http://localhost:3001";

  const submit = async (e) => {
    e.preventDefault();
    const socket = io("http://localhost:3001");
    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData);
    try {
      const response = await axios.post(
        authenticationBaseURL + "/api/auth/login",
        user,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      axios.defaults.headers[
        "Authorization"
      ] = `Bearer ${response.data.accessToken}`;
      const token = response.data;

      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("userName", user.username);

      const userName = user.username;
      socket.emit("user-logged-in", userName);

      socket.on("updateOnlineUsers", (onlineUsers) => {
        console.log("Received online users:", onlineUsers);
      });
      console.log("Successful login");

      window.location.reload();
    } catch (err) {
      console.log(err.response.data);

      setError(
        typeof err.response.data === "string"
          ? err.response.data
          : "Some details are wrong. Please try again."
      );
    }
  };

  return (
    <>
      <Form onSubmit={submit}>
        <Row style={{ justifyContent: "center", paddingTop: "2%" }}>
          <Col xs={6}>
            <Stack gap={3}>
              <h1 className="title">Welcome to TalkBack</h1>
              <h2 className="secondary-title">
                {username
                  ? `Welcome back, ${username}!`
                  : "Please login or signup to commence using the application"}
              </h2>
              <Form.Control
                type="text"
                placeholder="Username *required"
                name="username"
                defaultValue={username} // Prefill username if exists
                required
              />
              <Form.Control
                type="password"
                placeholder="Password *required"
                name="password"
                required
              />
              <Button variant="primary" type="submit">
                Submit
              </Button>
              {error && <Alert variant="danger">{error}</Alert>}{" "}
              <h3 className="mt-3">
                If you aren't registered yet, click Register
              </h3>
              <Button
                variant="primary"
                onClick={() => navigate("/register")}
                id="register"
              >
                Sign Up
              </Button>
            </Stack>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default LogIn;
