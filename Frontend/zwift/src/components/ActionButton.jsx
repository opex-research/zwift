import React from "react";
import { Box } from "@mui/material";
import PayPalLoginButton from "./RegistrationButtons"; // Ensure this is imported from the correct file
import CustomButton from "./EssentialComponents/CustomButton";

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

  if (metaMaskLogged) {
    switch (status) {
      case "registered":
        buttonText = "logged in";
        clickHandler = () => {}; // No action needed
        break;
      case "pending":
        buttonText =
          "pending - we are waiting for the transaction to be confirmed";
        clickHandler = retryRegistration; // Retries registration
        break;
      case "not_registered":
        if (!email) {
          renderPayPalButton = true;
        } else {
          buttonText =
            "registering you - please confirm the metamask transaction";
          clickHandler = onRegister;
        }
        break;
      default:
        buttonText = "connect your wallet";
        break;
    }
  }

  return (
    <Box>
      {!renderPayPalButton ? (
        <CustomButton
          onClick={clickHandler}
          disabled={status === "registered" || status === "pending"}
          buttonText={buttonText}
        />
      ) : (
        <PayPalLoginButton />
      )}
    </Box>
  );
};

export default ActionButton;
