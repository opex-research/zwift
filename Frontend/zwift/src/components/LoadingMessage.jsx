import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const LoadingMessage = ({ message = "LOGGING YOU IN" }) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => (prevDots.length < 3 ? prevDots + "." : ""));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          backgroundColor: "black",
          color: "white",
          borderRadius: "12px",
          padding: "20px",
          textAlign: "center",
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.19)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "Arial",
            fontSize: "14px",
            textTransform: "none",
          }}
        >
          {message}
          {dots}
        </Typography>
        <Box
          sx={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "3px solid white",
            borderColor: "white transparent white transparent",
            animation: "spin 1.2s linear infinite",
          }}
        />
      </Box>
      <style>
        {`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}
      </style>
    </Box>
  );
};

export default LoadingMessage;
