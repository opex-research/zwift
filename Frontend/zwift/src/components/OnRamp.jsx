import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Box,
  MenuItem,
  Paper,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useAccount } from "../context/AccountContext";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PayPalPaymentButton from "./PaymentButton";
import {
  getPeerForOnRamp,
  onRamp,
} from "../services/OrchestratorOnRampService";
import { handlePayment } from "./PaymentButton";
import CustomButton from "./EssentialComponents/CustomButton";
import CustomTextField from "./EssentialComponents/CustomTextField";
import CustomTypographyLabel from "./EssentialComponents/CustomTypographyLabel";

/**
 * OnRamp Component
 *
 * This component handles the on-ramping process, allowing users to convert fiat currency to cryptocurrency.
 * It manages the flow of selecting a currency, entering an amount, finding a peer, and initiating a payment.
 */
const OnRamp = () => {
  // Context and state management
  const { openOffRampsInQueue, registeredEmail, account } = useAccount();
  const [searchForPeerState, setSearchForPeer] = useState("off");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [amount, setAmount] = useState("5");
  const [showSearchButton, setShowSearchButton] = useState(true);

  const currencies = ["USD", "EUR", "JPY"];
  const isSearchDisabled = openOffRampsInQueue === 0;

  // Check for payment verification on component mount
  useEffect(() => {
    const paymentVerified = sessionStorage.getItem("paymentVerified");
    if (paymentVerified === "success") {
      setShowPaymentSuccess(true);
      sessionStorage.removeItem("paymentVerified");
      continueAfterPaymentSuccess();
    }
  }, []);

  /**
   * Initiates the on-ramp process by finding a peer and starting the payment process
   */
  const startOnRampProcess = async () => {
    try {
      const { peerAddress, peerEmail } = await getPeerForOnRamp();
      console.log("Peer Address:", peerAddress);
      console.log("Peer Email:", peerEmail);

      // Store peer information in session storage
      sessionStorage.setItem("offRamperAddress", peerAddress);
      sessionStorage.setItem("offRamperEmail", peerEmail);
      sessionStorage.setItem("onRamperEmailSession", registeredEmail);

      setSearchForPeer("found");
      handlePayment();
    } catch (error) {
      console.error("Error searching for Peer:", error);
      setSearchForPeer("off");
    }
  };

  /**
   * Continues the on-ramp process after successful payment
   */
  const continueAfterPaymentSuccess = async () => {
    console.log("Executing further steps after payment success.");
    const offRamperAddress = sessionStorage.getItem("offRamperAddress");
    const offRamperEmail = sessionStorage.getItem("offRamperEmail");
    const onRamperEmail = sessionStorage.getItem("onRamperEmailSession");

    try {
      const result = await onRamp(
        "5", // Expected amount for an onRamp
        offRamperAddress,
        onRamperEmail,
        offRamperEmail,
        "5", // Fiat amount converted to ETH sent via PayPal
        account
      );
      console.log("OnRamp Success:", result);
      setSearchForPeer("found");
    } catch (error) {
      console.error("Error performing OnRamp:", error);
      setSearchForPeer("off");
    }
  };

  // Event handlers
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    setAmount("");
    setShowSearchButton(false);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setShowSearchButton(event.target.value.trim() !== "");
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      <Paper
        sx={{
          padding: 4,
          background: "black",
          color: "white",
          borderRadius: "12px",
          margin: "auto",
          minWidth: 550,
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.19)",
        }}
        elevation={4}
      >
        <Stack spacing={3}>
          {/* Currency selection */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
              <CurrencyExchangeIcon
                sx={{ mr: 2, color: "gray", fontSize: 24 }}
              />
              <CustomTypographyLabel value="select currency" />
            </Box>
            <TextField
              select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              variant="outlined"
              disabled={true}
              sx={{
                width: "40%",
                ".MuiSelect-select": {
                  pr: 1,
                  color: "white",
                  backgroundColor: "#333",
                  borderRadius: "12px",
                  fontSize: 16,
                },
                ".MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: "transparent",
                    borderRadius: "12px",
                  },
                  "&:hover fieldset": { borderColor: "white" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
              }}
              SelectProps={{ IconComponent: "div" }}
            >
              {currencies.map((currency) => (
                <MenuItem
                  key={currency}
                  value={currency}
                  sx={{ color: "black", fontSize: 16 }}
                >
                  {currency}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Amount input */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
              <AttachMoneyIcon sx={{ mr: 2, color: "gray", fontSize: 24 }} />
              <Typography sx={{ width: "100%", fontSize: 18 }}>
                enter amount
              </Typography>
            </Box>
            <CustomTextField value={amount} onChange={handleAmountChange} />
          </Box>

          {/* Amount display and search button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography sx={{ fontSize: 16, color: "white" }}>
              you will receive{" "}
              <Box
                component="span"
                sx={{ color: "darkred", fontWeight: "bold" }}
              >
                5 ETH
              </Box>
            </Typography>
            {showSearchButton && (
              <CustomButton
                onClick={startOnRampProcess}
                disabled={isSearchDisabled}
                buttonText="search for peer"
              />
            )}
          </Box>

          {/* OnRamp button */}
          {searchForPeerState === "found" && PayPalPaymentButton}

          {/* Loading spinner */}
          {searchForPeerState === "searching" && <CircularProgress />}

          {/* Payment success message */}
          {showPaymentSuccess && (
            <Box sx={{ p: 2, backgroundColor: "#d4edda", textAlign: "center" }}>
              <Typography variant="h6" color="green">
                PAYMENT SUCCESSFUL
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </div>
  );
};

export default OnRamp;
