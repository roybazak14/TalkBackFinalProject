import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Logout = ({ onLogout, fromNavbar }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authenticationBaseURL = "https://localhost:7208";

  const deleteUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const tokenStr = localStorage.getItem("token");
      const tokenJson = JSON.parse(tokenStr);
      const accessToken = tokenJson?.accessToken;

      if (!accessToken) {
        throw new Error("Access token not found.");
      }

      const response = await axios.post(
        authenticationBaseURL + "/api/auth/logout",
        {}, // Send an empty object as the request body
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 204) {
        localStorage.clear();
        navigate("/login");
        onLogout();
        if (!fromNavbar) {
          window.location.reload();
        }
      } else {
        throw new Error("Logout failed.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Failed to sign out. Please try again later.");
      }
      console.error("Failed to sign out:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p>{error}</p>}
      <button onClick={deleteUser} disabled={loading}>
        {loading ? "Logging Out..." : "Log Out"}
      </button>
    </div>
  );
};

export default Logout;
