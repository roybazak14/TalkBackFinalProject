import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { Button, Row, Alert, Form, Col, Stack } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const formData = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value,
      confirmPassword: e.target.elements.confirmPassword.value,
    };
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    const usernameRegex = /^[\w]{5,20}$/;

    let errorMessage = "";
    const authServiceIp = "https://localhost:7208";

    switch (true) {
      case !passwordRegex.test(formData.password):
        errorMessage =
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        break;
      case formData.password !== formData.confirmPassword:
        errorMessage = "Your passwords don't match";
        break;
      case !usernameRegex.test(formData.username):
        errorMessage =
          "Username must be 5-20 characters long and can only contain letters and numbers.";
        break;
      default:
        break;
    }

    try {
      if (errorMessage) {
        setIsRegisterLoading(false);
        setRegisterError(errorMessage);
        return;
      }

      setIsRegisterLoading(true);
      const response = await axios.post(
        authServiceIp + "/api/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsRegisterLoading(false);
      alert("Successful registration");
      navigate("/");
      const token = response.data;
      return token;
    } catch (err) {
      setIsRegisterLoading(false);
      console.log(err.message);
      setRegisterError("An error has occurred");
    }
  };

  return (
    <>
      <Form onSubmit={submit}>
        <Row
          style={{
            height: "100vh",
            justifyContent: "center",
            paddingTop: "2%",
          }}
        >
          <Col xs={6}>
            <Stack gap={3}>
              <h2>Register</h2>
              <Form.Control
                type="text"
                placeholder="Username *required"
                name="username"
                required
              />
              <Form.Control
                type="password"
                placeholder="Password *required"
                name="password"
                required
              />
              <Form.Control
                type="password"
                placeholder="Confirm Password *required"
                name="confirmPassword"
                required
              />
              <Button
                variant="primary"
                type="submit"
                disabled={isRegisterLoading}
              >
                {isRegisterLoading ? "Signing up..." : "Submit"}
              </Button>
              {registerError && <Alert variant="danger">{registerError}</Alert>}{" "}
              <h3 className="mt-3">
                If you already have an account, click Log In
              </h3>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Log in
              </Button>
            </Stack>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Register;
