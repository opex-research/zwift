import React from "react";
import CustomButton from "./EssentialComponents/CustomButton";

const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

const PayPalLoginButton = () => {
  const handleLogin = () => {
    sessionStorage.setItem("preAuthTab", "account"); // You specifically want 'account' tab
    console.log("in handle WE SET", sessionStorage.getItem("preAuthTab"));
    sessionStorage.removeItem("checkoutInitiated");
    sessionStorage.removeItem("paymentVerified");

    const clientID =
      "ATWNj8MbBvdUupI3VbC-isIb-fxnQ7j8Op6ch7rds51niwt1xGU0yreyPaFweWF_PZE5Yi71EXILTY7-";
    const redirectURI = encodeURIComponent(`${frontendUrl}/auth-handler`);

    const paypalLoginURL = `https://sandbox.paypal.com/signin/authorize?client_id=${clientID}&response_type=code&redirect_uri=${redirectURI}`;

    // Redirect user to PayPal login
    window.location.href = paypalLoginURL;
  };

  return (
    <CustomButton
      onClick={handleLogin}
      buttonText="retrieve your paypal email"
    />
  );
};

export default PayPalLoginButton;
