import React, { useState } from "react";
import {
  TextField,
  Typography,
  Divider,
  useTheme,
  Button,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Stack,
} from "@mui/material";
import OffRampIcon from "@mui/icons-material/Launch";
import CustomTypographyLabel from "./EssentialComponents/CustomTypographyLabel";
import { useAccount } from "../context/AccountContext";
import {
  newOffRampIntent,
  getUsersOpenOffRampIntents,
} from "../services/OrchestratorOffRampService";
import OkIcon from "../icons/icons8-ok-48.png"; // Import the PNG file
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar"; // Adjust the path as necessary
import CustomButton from "./EssentialComponents/CustomButton";
import CustomTextField from "./EssentialComponents/CustomTextField";
const OffRamp = () => {
  const { account, setUsersPendingOffRampIntents, usersPendingOffRampIntents } =
    useAccount();
  const [offRampIntentCreated, setOffRampIntentCreated] = useState(false);
  const [amount, setAmount] = useState("0.00035"); // Keep amount as string for TextField compatibility
  const { error, showError } = useErrorHandler();
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  // Handles closing of Snackbar
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleOffRampClick = async () => {
    const amountNum = parseFloat(amount);

    try {
      const createdOffRamp = await newOffRampIntent(account, amountNum);

      if (!createdOffRamp) {
        showError("Failed tto initialize and off-ramp contract."); // Display the dynamic error message
        setOpen(true);
        console.error(
          "Failed to create off-ramp intent without throwing an error."
        );
        return;
      }

      setOffRampIntentCreated(true);

      const newPendingOffRampIntentBalance =
        parseFloat(usersPendingOffRampIntents) + parseFloat(amountNum);
      // If setUsersOffRampIntent expects a string
      setUsersPendingOffRampIntents(newPendingOffRampIntentBalance);
    } catch (error) {
      showError(error.message || "An unexpected error occurred."); // Display the dynamic error message
      setOpen(true);
      console.error("Error initializing off-ramp intent:", error);
    }
  };

  const handleCreateAnother = () => {
    setOffRampIntentCreated(false);
    setAmount("0.00035");
  };

  if (offRampIntentCreated) {
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
                <Typography sx={{ width: "100%", fontSize: 18 }}>
                  Your offramp intent is created and will be mined on the chain
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </div>
    );
  }

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
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <OffRampIcon sx={{ mr: 2, color: "gray", fontSize: 24 }} />
                <CustomTypographyLabel value="set the amount to offramp" />
              </Box>
            </Box>
            <CustomTextField value={amount} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <CustomButton
              onClick={handleOffRampClick}
              disabled={false}
              buttonText={"Crate OffRamp Intent"}
            ></CustomButton>
          </Box>
        </Stack>
      </Paper>
    </div>
  );
};

export default OffRamp;
