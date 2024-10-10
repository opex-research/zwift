import React from "react";
import { Box } from "@mui/material";
import PayPalLoginButton from "./RegistrationButtons";
import CustomButton from "./EssentialComponents/CustomButton";

/**
 * ActionButton component handles different states of user authentication and registration.
 * It displays either a custom button or a PayPal login button based on the current state.
 *
 * @param {Object} props - Component props
 * @param {string} props.status - Current status of the user (registered, pending, not_registered)
 * @param {function} props.onConnect - Function to handle wallet connection
 * @param {function} props.onRegister - Function to handle user registration
 * @param {boolean} props.metaMaskLogged - Indicates if user is logged in with MetaMask
 * @param {string} props.email - User's email address
 * @param {function} props.retryRegistration - Function to retry registration
 * @returns {React.Component} Rendered ActionButton component
 */
const ActionButton = ({
  status,
  onConnect,
  onRegister,
  metaMaskLogged,
  email,
  retryRegistration,
}) => {
  let buttonText = "connect your wallet";
  let clickHandler = onConnect;
  let renderPayPalButton = false;

  // Determine button text and click handler based on MetaMask login status and user status
  if (metaMaskLogged) {
    switch (status) {
      case "registered":
        buttonText = "logged in";
        clickHandler = () => {}; // No action needed when logged in
        break;
      case "pending":
        buttonText = "pending - waiting for transaction confirmation";
        clickHandler = retryRegistration;
        break;
      case "not_registered":
        if (!email) {
          renderPayPalButton = true;
        } else {
          buttonText = "registering - confirm MetaMask transaction";
          clickHandler = onRegister;
        }
        break;
      // Default case uses initial values set above
    }
  }

  return (
    <Box>
      {renderPayPalButton ? (
        <PayPalLoginButton />
      ) : (
        <CustomButton
          onClick={clickHandler}
          disabled={status === "registered" || status === "pending"}
          buttonText={buttonText}
        />
      )}
    </Box>
  );
};

export default ActionButton;
