import React, { useState } from "react";
import { Typography, Box, Paper, Stack } from "@mui/material";
import OffRampIcon from "@mui/icons-material/Launch";
import CustomTypographyLabel from "./EssentialComponents/CustomTypographyLabel";
import CustomButton from "./EssentialComponents/CustomButton";
import CustomTextField from "./EssentialComponents/CustomTextField";
import { useAccount } from "../context/AccountContext";
import { newOffRampIntent } from "../services/OrchestratorOffRampService";
import useErrorHandler from "../hooks/useErrorHandler";

/**
 * OffRamp Component
 *
 * This component handles the off-ramping process, allowing users to create
 * off-ramp intents for a specified amount.
 */
const OffRamp = () => {
  const { account, setUsersPendingOffRampIntents, usersPendingOffRampIntents } =
    useAccount();
  const [offRampIntentCreated, setOffRampIntentCreated] = useState(false);
  const [amount, setAmount] = useState("5");
  const { showError } = useErrorHandler();

  /**
   * Handles the creation of a new off-ramp intent
   */
  const handleOffRampClick = async () => {
    const amountNum = parseFloat(amount);

    try {
      const createdOffRamp = await newOffRampIntent(account, amountNum);

      if (!createdOffRamp) {
        showError("Failed to initialize an off-ramp contract.");
        console.error(
          "Failed to create off-ramp intent without throwing an error."
        );
        return;
      }

      setOffRampIntentCreated(true);

      // Update the pending off-ramp intents balance
      const newPendingOffRampIntentBalance =
        parseFloat(usersPendingOffRampIntents) + amountNum;
      setUsersPendingOffRampIntents(newPendingOffRampIntentBalance.toString());
    } catch (error) {
      showError(error.message || "An unexpected error occurred.");
      console.error("Error initializing off-ramp intent:", error);
    }
  };

  /**
   * Renders the success message after creating an off-ramp intent
   */
  const renderSuccessMessage = () => (
    <Paper sx={paperStyles}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: 18 }}>
            Your off-ramp intent is created and will be mined on the chain
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  /**
   * Renders the off-ramp creation form
   */
  const renderOffRampForm = () => (
    <Paper sx={paperStyles}>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "60%" }}>
            <OffRampIcon sx={{ mr: 2, color: "gray", fontSize: 24 }} />
            <CustomTypographyLabel value="Set the amount to off-ramp" />
          </Box>
          <CustomTextField
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CustomButton
            onClick={handleOffRampClick}
            buttonText="Create OffRamp Intent"
          />
        </Box>
      </Stack>
    </Paper>
  );

  // Common styles for the Paper component
  const paperStyles = {
    padding: 4,
    background: "black",
    color: "white",
    borderRadius: "12px",
    margin: "auto",
    minWidth: 550,
    boxShadow:
      "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.19)",
  };

  return (
    <div style={{ paddingTop: "20px" }}>
      {offRampIntentCreated ? renderSuccessMessage() : renderOffRampForm()}
    </div>
  );
};

export default OffRamp;
