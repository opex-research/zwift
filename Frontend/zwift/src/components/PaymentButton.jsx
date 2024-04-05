import React from "react";
// Importing UI components from MUI
import { Button } from "@mui/material";
const PayPalPaymentButton = () => {
  const handlePayment = () => {
    sessionStorage.removeItem("checkoutInitiated");
    sessionStorage.removeItem("paymentVerified");

    const clientID =
      "ATWNj8MbBvdUupI3VbC-isIb-fxnQ7j8Op6ch7rds51niwt1xGU0yreyPaFweWF_PZE5Yi71EXILTY7-";
    const redirectURI = encodeURIComponent(
      "http://127.0.0.1:3000/checkout-handler"
    );

    const paypalLoginURL = `https://sandbox.paypal.com/signin/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}`;

    // Redirect user to PayPal login
    window.location.href = paypalLoginURL;
  };

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
