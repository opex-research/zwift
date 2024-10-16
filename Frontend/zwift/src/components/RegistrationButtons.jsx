import React from "react";
import CustomButton from "./EssentialComponents/CustomButton";

// Retrieve the frontend URL from environment variables
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;

// PayPal client ID should be stored in an environment variable for security
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

/**
 * PayPalLoginButton Component
 *
 * This component renders a button that initiates the PayPal login process.
 * When clicked, it prepares the necessary parameters and redirects the user to PayPal's login page.
 */
const PayPalLoginButton = () => {
  const handleLogin = () => {
    // Set the desired tab for post-authentication navigation
    sessionStorage.setItem("preAuthTab", "account");

    // Clear any existing checkout or payment verification data
    sessionStorage.removeItem("checkoutInitiated");
    sessionStorage.removeItem("paymentVerified");

    // Prepare the redirect URI for PayPal to return to after authentication
    const redirectURI = encodeURIComponent(`${FRONTEND_URL}/auth-handler`);

    // Construct the PayPal login URL
    const paypalLoginURL = `https://sandbox.paypal.com/signin/authorize?client_id=${PAYPAL_CLIENT_ID}&response_type=code&redirect_uri=${redirectURI}`;

    // Redirect the user to PayPal's login page
    window.location.href = paypalLoginURL;
  };

  return (
    <CustomButton
      onClick={handleLogin}
      buttonText="Retrieve Your PayPal Email"
    />
  );
};

export default PayPalLoginButton;
