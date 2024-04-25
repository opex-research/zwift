import React from "react";
import { Button } from "@mui/material";

const ActionButton = ({
  status,
  onConnect,
  onRegister,
  metaMaskLogged,
  email,
  retryRegistration,
  onGetEmail,
}) => {
  let buttonText = "Connect to Wallet";
  let clickHandler = onConnect;

  if (metaMaskLogged) {
    switch (status) {
      case "registered":
        buttonText = "Logged in";
        clickHandler = () => {}; // No action needed
        break;
      case "pending":
        buttonText = "Pending...";
        clickHandler = retryRegistration; // Retries registration
        break;
      case "not_registered":
        buttonText = email
          ? "Registering..."
          : "Get PayPal Email to Finish Login";
        clickHandler = email ? onRegister : onGetEmail; // If email is present, register, otherwise get email
        break;
      default:
        buttonText = "Connect to Wallet";
        break;
    }
  }

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={clickHandler}
      disabled={status === "registered" || status === "pending"}
    >
      {buttonText}
    </Button>
  );
};

export default ActionButton;
