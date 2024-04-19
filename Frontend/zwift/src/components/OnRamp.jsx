import React, { useState, useEffect } from "react";
import {
  TextField,
  Typography,
  Button,
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

const OnRamp = () => {
  // State variables
  const [email, setEmail] = useState("");
  const [successfullResponse, setResponse] = useState(false);
  const [offRamperAddress, setOffRamperAddress] = useState(null);
  const { openOffRampsInQueue, registeredEmail } = useAccount();
  const [searchForPeerState, setSearchForPeer] = useState("off");
  const isSearchDisabled = openOffRampsInQueue === 0;
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [amount, setAmount] = useState("");
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const currencies = ["USD", "EUR", "JPY"];

  // Check if payment is verified on component mount
  useEffect(() => {
    const paymentVerified = sessionStorage.getItem("paymentVerified");
    if (paymentVerified === "success") {
      setShowPaymentSuccess(true);
      sessionStorage.removeItem("paymentVerified");
    }
  }, []);

  // Event handlers
  const handleResponseChange = (newValue) => {
    setResponse(newValue);
  };

  const handleBackButton = () => {
    setResponse(false);
  };

  const handleSearchForPeer = async () => {
    try {
      const { peerAddress, peerEmail } = await getPeerForOnRamp();
      setEmail(peerEmail);
      setOffRamperAddress(peerAddress);
      setSearchForPeer("found");
    } catch (error) {
      console.error("Error searching for Peer:", error);
      setSearchForPeer("off");
    }
  };

  const handleOnRamp = async () => {
    try {
      const result = await onRamp(
        "1",
        offRamperAddress,
        registeredEmail,
        email,
        "1"
      );
      console.log("OnRamp Success:", result);
      setSearchForPeer("found");
    } catch (error) {
      console.error("Error performing OnRamp:", error);
      setSearchForPeer("off");
    }
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    setShowAmountInput(true);
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
              <Typography sx={{ width: "100%", fontSize: 18 }}>
                select currency
              </Typography>
            </Box>
            <TextField
              select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              variant="outlined"
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
                  "&:hover fieldset": {
                    borderColor: "white",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "white",
                  },
                },
              }}
              SelectProps={{
                IconComponent: "div",
              }}
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
          {showAmountInput && (
            <>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "60%" }}
                >
                  <AttachMoneyIcon
                    sx={{ mr: 2, color: "gray", fontSize: 24 }}
                  />
                  <Typography sx={{ width: "100%", fontSize: 18 }}>
                    enter amount
                  </Typography>
                </Box>
                <TextField
                  value={amount}
                  onChange={handleAmountChange}
                  variant="outlined"
                  inputProps={{
                    style: {
                      color: "white",
                    },
                  }}
                  sx={{
                    width: "40%",
                    backgroundColor: "#333",
                    borderRadius: "12px",
                    ".MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      "& fieldset": {
                        borderColor: "transparent",
                        borderRadius: "12px",
                      },
                      "&:hover fieldset": {
                        borderColor: "white",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: 16,
                      },
                    },
                  }}
                />
              </Box>
              {/* Container for the amount and button */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {/* Text "You will receive..." */}
                <Typography
                  sx={{
                    fontSize: 16,
                    color: "white",
                  }}
                >
                  you will receive{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "darkred",
                      fontWeight: "bold",
                    }}
                  >
                    1 ETH,
                  </Box>
                </Typography>

                {/* Search for Peer button */}
                {showSearchButton && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearchForPeer}
                    disabled={isSearchDisabled}
                    sx={{
                      background: `${
                        isSearchDisabled ? "grey" : "black"
                      } !important`,
                      color: `${
                        isSearchDisabled ? "lightgrey" : "white"
                      } !important`,
                      borderRadius: "12px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        backgroundColor: `${
                          isSearchDisabled ? "grey" : "darkred"
                        } !important`,
                      },
                      "&:active": {
                        backgroundColor: `${
                          isSearchDisabled ? "grey" : "#cc0000"
                        } !important`,
                      },
                      "& .MuiButton-startIcon": {
                        color: `${
                          isSearchDisabled ? "lightgrey" : "darkred"
                        } !important`,
                      },
                      "& .MuiButton-endIcon": {
                        color: `${
                          isSearchDisabled ? "lightgrey" : "darkred"
                        } !important`,
                      },
                      fontSize: 14,
                      padding: "6px 12px",
                      textTransform: "none",
                      width: "fit-content",
                    }}
                  >
                    search for peer
                  </Button>
                )}
              </Box>
            </>
          )}

          {/* OnRamp button */}
          {searchForPeerState === "found" && PayPalPaymentButton}

          {/* Loading spinner */}
          {searchForPeerState === "searching" && <CircularProgress />}

          {/* Perform another OnRamp transaction button */}
          {successfullResponse && (
            <Button
              variant="outlined"
              onClick={handleBackButton}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "white",
                },
              }}
            >
              Perform another OnRamp Transaction
            </Button>
          )}
        </Stack>
      </Paper>
    </div>
  );
};

export default OnRamp;
