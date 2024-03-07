import React from "react";
import { Paper } from "@mui/material";
import LoginCard from "../components/LoginCard"; // Adjust path as necessary

function LoginPage() {
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
      <LoginCard />
    </Paper>
  );
}

export default LoginPage;
