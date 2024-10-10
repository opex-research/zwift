import React from "react";
import { Button } from "@mui/material";

/**
 * Initiates the PayPal payment process.
 * Clears relevant session storage items and redirects to PayPal login.
 */
export const handlePayment = () => {
  // Clear session storage
  ["checkoutInitiated", "paymentVerified"].forEach((item) =>
    sessionStorage.removeItem(item)
  );

  // Construct PayPal login URL
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
  const clientID = process.env.REACT_APP_PAYPAL_CLIENT_ID;
  const redirectURI = encodeURIComponent(`${frontendUrl}/checkout-handler`);
  const paypalLoginURL = `https://sandbox.paypal.com/signin/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}`;

  // Redirect user to PayPal login
  window.location.href = paypalLoginURL;
};

/**
 * PayPal payment button component.
 * Renders a button that initiates the PayPal payment process when clicked.
 */
const PayPalPaymentButton = () => (
  <Button onClick={handlePayment} sx={buttonStyle}>
    PAY
  </Button>
);

// Styles for the PayPal payment button
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
