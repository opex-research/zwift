import React from "react";
import { Paper } from "@mui/material";
import { ErrorBoundary } from "react-error-boundary";
import LoginCard from "../components/LoginCard"; // Adjust path as necessary
import FallbackComponent from "../components/ErrorBoundary"; // Import your fallback component

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
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={(error, errorInfo) => {
          console.log("Logging error:", error, errorInfo);
        }}
        onReset={() => {
          // Optionally reset your application's state here
        }}
      >
        <LoginCard />
      </ErrorBoundary>
    </Paper>
  );
}

export default LoginPage;
