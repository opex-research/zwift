import React from "react";
// Importing UI components from MUI
import { Button } from "@mui/material";

export const handlePayment = () => {
  sessionStorage.removeItem("checkoutInitiated");
  sessionStorage.removeItem("paymentVerified");

  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

  const clientID =
    "ATWNj8MbBvdUupI3VbC-isIb-fxnQ7j8Op6ch7rds51niwt1xGU0yreyPaFweWF_PZE5Yi71EXILTY7-";
  const redirectURI = encodeURIComponent(`${frontendUrl}/checkout-handler`);
  const paypalLoginURL = `https://sandbox.paypal.com/signin/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}`;

  // Redirect user to PayPal login
  window.location.href = paypalLoginURL;
};

const PayPalPaymentButton = () => {
  return (
    <Button onClick={handlePayment} sx={buttonStyle}>
      PAY
    </Button>
  );
};
// Button style reused in multiple components
const buttonStyle = {
  color: "#1B6AC8",
  fontSize: "20px",
  display: "flex",
  justifyContent: "flex-start",
  textTransform: "none",
  marginBottom: 1,
  "&:hover": {
    backgroundColor: "#47a7f5",
    color: "white",
  },
};
export default PayPalPaymentButton;
