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
import { useAccount } from "../context/AccountContext";
import { newOffRampIntent } from "../services/OrchestratorOffRampService";
import OffRampIcon from "../icons/icons8-münzen-48.png"; // Import the PNG file
import OkIcon from "../icons/icons8-ok-48.png"; // Import the PNG file
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar"; // Adjust the path as necessary

const OffRamp = () => {
  const { account, setUsersOffRampIntent, usersOffRampIntent } = useAccount();
  const [offRampIntentCreated, setOffRampIntentCreated] = useState(false);
  const [amount, setAmount] = useState("1"); // Keep amount as string for TextField compatibility
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
    const amountNum = parseInt(amount, 10);

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
      const newUsersOpenOffRampIntent =
        parseInt(usersOffRampIntent, 10) + amountNum;
      setUsersOffRampIntent(newUsersOpenOffRampIntent);
    } catch (error) {
      showError(error.message || "An unexpected error occurred."); // Display the dynamic error message
      setOpen(true);
      console.error("Error initializing off-ramp intent:", error);
    }
  };

  const handleCreateAnother = () => {
    setOffRampIntentCreated(false);
    setAmount("1");
  };

  if (offRampIntentCreated) {
    return (
      <div
        style={{
          paddingTop: "20px",
        }}
      >
        <Grid container spacing={2} direction="column">
          <Grid item container alignItems="center">
            <Grid
              container
              alignItems="center"
              spacing={2}
              sx={{ marginBottom: theme.spacing(1) }}
            >
              <Grid item>
                <img
                  src={OkIcon}
                  alt="Ok Icon"
                  style={{ width: "50%", height: "50%" }}
                />
              </Grid>
              <Grid item xs>
                <Typography
                  variant="caption"
                  display="block"
                  color="textSecondary"
                  sx={{ marginBottom: 1 }}
                >
                  SUCCESSFULLY CREATED OFFRAMP INTENT
                </Typography>
                <Stack
                  direction="row"
                  sx={{ width: "100%", alignItems: "center" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      height: 25,
                      borderRadius: "10px",
                      backgroundColor: "#C8E6C9",
                      color: "#7eb55c",
                      padding: theme.spacing(0, 1),
                    }}
                  >
                    <Typography
                      variant="h7"
                      component="span"
                      sx={{ color: "inherit" }}
                      padding="10px"
                    >
                      The amount of $100 was Off-Ramped
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "20px",
      }}
    >
      <Grid container spacing={2} direction="column">
        <Grid item container alignItems="center">
          <Grid
            container
            alignItems="center"
            spacing={2}
            sx={{ marginBottom: theme.spacing(1) }}
          >
            <Grid item>
              <img
                src={OffRampIcon}
                alt="OffRamp Icon"
                style={{ width: "50%", height: "50%" }}
              />
            </Grid>
            <Grid item xs>
              <Typography
                variant="caption"
                display="block"
                color="textSecondary"
                sx={{ marginBottom: 1 }}
              >
                SET THE AMOUNT TO OFFRAMP
              </Typography>
              <Stack
                direction="row"
                sx={{ width: "100%", alignItems: "center" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    height: 25,
                    borderRadius: "10px",
                    backgroundColor: "#F7FAFD",
                    color: "#1B6AC8",
                    padding: theme.spacing(0, 1),
                  }}
                >
                  <Typography
                    variant="h7"
                    component="span"
                    sx={{ color: "inherit" }}
                    padding="10px"
                  >
                    $100
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Box display="flex" justifyContent="center">
            <Button variant="outlined" onClick={handleOffRampClick}>
              Create OffRamp Intent
            </Button>
          </Box>
        </Grid>
      </Grid>
      <ErrorSnackbar
        open={open}
        handleClose={handleErrorClose}
        errorMessage={error}
      />
    </div>
  );
};

export default OffRamp;
