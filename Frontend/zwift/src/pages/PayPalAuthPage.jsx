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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      setLoading(false);
      return;
    }

    axios
      .post(`http://127.0.0.1:3001/api/auth/paypal?code=${code}`)
      .then((response) => {
        console.log("Success:", response.data);
        setPaypalEmail(response.data.email);
        setLoading(false);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
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
