import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import LoadingMessage from "../components/LoadingMessage";
import { Paper } from "@mui/material";

const PayPalAuthPage = () => {
  const navigate = useNavigate();
  const { setPaypalEmail } = useAccount();
  const [loading, setLoading] = useState(true);
  const goBackendUrl = process.env.REACT_APP_GO_BACKEND_URL;
  const pythonBackendUrl = process.env.REACT_APP_PYTHON_BACKEND_URL;

  useEffect(() => {
    // Extract the code from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      const formData = new FormData();
      formData.append("authorizationCode", code); // Assuming the backend expects an 'access_token' field

      // Make the Axios POST request with formData
      axios
        .post(`${goBackendUrl}/api/auth/login`, formData, {
          withCredentials: true, // Important for sessions/cookies to be included
          headers: { "Content-Type": "multipart/form-data" }, // Set the Content-Type for form data
        })
        .then((loginResponse) => {
          console.log("Login success:", loginResponse.data);
          setPaypalEmail(loginResponse.data.email);
          setLoading(false);
          navigate("/");
        })
        .catch((loginError) => {
          console.error("Login error:", loginError);
          setLoading(false);
        });
    }
  }, [navigate, setPaypalEmail]);

  if (loading) {
    return (
      <Paper
        elevation={4}
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(to right, #bbdefb, #e1f5fe)",
        }}
      >
        <LoadingMessage message="Processing PayPal login" />
      </Paper>
    );
  }

  return null;
};

export default PayPalAuthPage;
