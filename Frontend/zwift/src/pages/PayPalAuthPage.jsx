import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import LoadingMessage from "../components/LoadingMessage"; // Ensure correct import path
import { Paper } from "@mui/material"; // Import Paper for consistent styling

const PayPalAuthPage = () => {
  const navigate = useNavigate();
  const { setPaypalEmail } = useAccount();
  const [loading, setLoading] = useState(true); // Maintain the loading state

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      axios
        .post(`http://127.0.0.1:3001/api/auth/paypal?code=${code}`)
        .then((response) => {
          console.log("Success:", response.data);
          setPaypalEmail(response.data.email); // Set the PayPal email in context
          setLoading(false); // Update the loading state
          navigate("/dashboard"); // Navigate to the dashboard on success
        })
        .catch((error) => {
          console.error("Error:", error);
          setLoading(false); // Update the loading state even on error
          // Handle the error as needed
        });
    } else {
      setLoading(false); // Ensure loading is false if no code is present
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

  // Once loading is complete, render null or handle redirection already being taken care of by navigate()
  return null;
};

export default PayPalAuthPage;
