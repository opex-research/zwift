import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

/**
 * LoadingAccount Component
 *
 * This component displays a loading message with an animated ellipsis and a spinner
 * while waiting for the user to connect their wallet.
 */
const LoadingAccount = () => {
  // State to manage the ellipsis animation
  const [ellipsis, setEllipsis] = useState("");

  useEffect(() => {
    // Array of ellipsis states
    const ellipsisStates = ["", ".", "..", "..."];
    let count = 0;

    // Set up interval for ellipsis animation
    const interval = setInterval(() => {
      setEllipsis(ellipsisStates[count % ellipsisStates.length]);
      count++;
    }, 500);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontFamily: "Arial", fontSize: "14px", textTransform: "none" }}
        >
          Waiting for you to connect your wallet{ellipsis}
        </Typography>
        <Box
          sx={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            border: "3px solid white",
            borderColor: "white transparent white transparent",
            animation: "spin 1.2s linear infinite",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default LoadingAccount;
