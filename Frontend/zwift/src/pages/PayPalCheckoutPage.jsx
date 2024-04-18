import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import paypalCheckoutService from "../services/PayPalService";
import LoadingMessage from "../components/LoadingMessage";
import { Paper } from "@mui/material";
const PayPalCheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // Function to handle URL query parameters and session states
  const getUrlParamsAndSessionStates = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      token: urlParams.get("token"),
      PayerID: urlParams.get("PayerID"),
      code: urlParams.get("code"),
      paymentVerified: sessionStorage.getItem("paymentVerified"),
      checkoutInitiated: sessionStorage.getItem("checkoutInitiated"),
    };
  };

  useEffect(() => {
    const { token, PayerID, code, paymentVerified, checkoutInitiated } =
      getUrlParamsAndSessionStates();

    // Conditions to check ongoing processes
    const isProcessingPayment =
      token && PayerID && paymentVerified === "inProgress";
    const isInitiatingCheckout = code && checkoutInitiated === "true";

    if (isProcessingPayment || isInitiatingCheckout) {
      console.log(
        "An operation is already in progress. Waiting for completion..."
      );
      return; // Early return to avoid unnecessary redirects
    }

    if (token && PayerID && paymentVerified !== "inProgress") {
      console.log("Verifying payment");
      sessionStorage.setItem("paymentVerified", "inProgress");
      verifyPayment(token, PayerID);
    } else if (code && !checkoutInitiated) {
      console.log("Initiating checkout");
      sessionStorage.setItem("checkoutInitiated", "true");
      handleCheckout(code);
    } else {
      navigate("/error");
    }
  }, [navigate]);

  const handleCheckout = async (code) => {
    try {
      const checkoutUrl = await paypalCheckoutService.initiateCheckout(code);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      navigate("/error");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (token, PayerID) => {
    try {
      const verificationResult = await paypalCheckoutService.verifyPayment(
        token,
        PayerID
      );
      const verificationStatus = verificationResult.success
        ? "success"
        : "failed";
      sessionStorage.setItem("paymentVerified", verificationStatus);
      if (verificationStatus == "success") {
        setPaypalPaymentSuccessfull(true);
      }
      navigateBasedOnVerification(verificationStatus);
    } catch (error) {
      console.error("Payment verification error:", error);
      sessionStorage.setItem("paymentVerified", "failed");
      navigate("/error");
    }
  };

  const navigateBasedOnVerification = (status) => {
    switch (status) {
      case "success":
        navigate("/dashboard");
        break;
      case "failed":
        navigate("/error");
        break;
      default:
        navigate("/error");
    }
  };

  return loading ? (
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
      <LoadingMessage message="Processing..." />
    </Paper>
  ) : null;
};

export default PayPalCheckoutPage;
