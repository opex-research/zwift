import React, { useState, useEffect } from "react";

// Importing UI components from MUI
import {
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  useTheme,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";

// Importing Error Handlers and Navigators
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar"; // Import components
import RefreshIcon from "@mui/icons-material/Refresh";
// Importing icons and logo
import WalletIcon from "../icons/icons8-brieftasche-48.png";
import MailIcon from "../icons/icons8-neuer-beitrag-48.png";
import CashIcon from "../icons/icons8-münzen-48.png";
import PendingIcon from "../icons/icons8-gegenwart-48.png";

import { getAccountInfo } from "../services/AccountInfoService";
/**
 * UserAccount Component
 * Displays user's account information including wallet address, email, balance, and offramp intent.
 */
const UserAccount = () => {
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { error, showError } = useErrorHandler();

  const {
    account,
    balance,
    registeredEmail,
    setLogged,
    setAccount,
    setBalance,
    setRegisteredEmail,
    usersOffRampIntent,
    setUsersOffRampIntent,
    setOpenOffRampsInQueue,
    usersPendingOffRampIntents,
    setUsersPendingOffRampIntents,
  } = useAccount();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          returnedBalance,
          returnedRegisteredEmail,
          returnedOpenOffRampsInQueue,
          returnedUsersOffRampIntent,
          returnedUsersPendingOffRampIntents,
        } = await getAccountInfo(account); // Assuming getAccountInfo is adjusted to return an object
        if (returnedBalance) setBalance(returnedBalance);
        if (returnedRegisteredEmail)
          setRegisteredEmail(returnedRegisteredEmail);
        if (returnedOpenOffRampsInQueue)
          setOpenOffRampsInQueue(returnedOpenOffRampsInQueue);
        if (returnedUsersOffRampIntent)
          setUsersOffRampIntent(returnedUsersOffRampIntent);
        if (returnedUsersPendingOffRampIntents)
          setUsersPendingOffRampIntents(returnedUsersPendingOffRampIntents);
        setRefreshLoading(false);
      } catch (error) {
        console.error("Error fetching account info:", error);
        // Optionally handle the error (e.g., show an error message)
      }
    };

    if (account) {
      fetchData();
    }
  }, [account]); // Dependency array ensures this effect runs when 'account' changes

  // Simulates network delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Account info display styles
  const infoItemStyle = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    height: 25,
    borderRadius: "10px",
    backgroundColor: "#F7FAFD",
    color: "#1B6AC8",
    padding: theme.spacing(0, 1),
  };

  // Handles closing of the error snackbar
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // Handles the logout process
  const handleLogout = async () => {
    setLoading(true);
    try {
      await delay(2000); // Simulate a logout delay
      // Reset user state and navigate to the home page
      setLogged(false);
      setAccount(null);
      setBalance();
      setRegisteredEmail("");
      setUsersOffRampIntent(0);
      setOpenOffRampsInQueue(0);
      setUsersPendingOffRampIntents(0);
      navigate("/");
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setLoading(false);
      setOpen(true);
    }
  };

  // Handles the logout process
  const handleRefresh = async () => {
    setRefreshLoading(true);
    await delay(1000);
    try {
      const {
        returnedBalance,
        returnedRegisteredEmail,
        returnedOpenOffRampsInQueue,
        returnedUsersOffRampIntent,
        returnedUsersPendingOffRampIntents,
      } = await getAccountInfo(account); // Assuming getAccountInfo is adjusted to return an object
      if (returnedBalance) setBalance(returnedBalance);
      if (returnedRegisteredEmail) setRegisteredEmail(returnedRegisteredEmail);
      if (returnedOpenOffRampsInQueue)
        setOpenOffRampsInQueue(returnedOpenOffRampsInQueue);
      if (returnedUsersOffRampIntent)
        setUsersOffRampIntent(returnedUsersOffRampIntent);
      if (returnedUsersPendingOffRampIntents)
        setUsersPendingOffRampIntents(returnedUsersPendingOffRampIntents);
      setRefreshLoading(false);
      console.log(usersPendingOffRampIntents);
    } catch (error) {
      console.error("Error fetching account info:", error);
      // Optionally handle the error (e.g., show an error message)
      showError(error.message || "An unexpected error occurred.");
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <div>
      {/* Account heading and logout button */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ marginBottom: 8 }}
      >
        <TypographyHeader />
        <RefreshButton loading={refreshLoading} handleRefresh={handleRefresh} />
        <LogoutButton loading={loading} handleLogout={handleLogout} />
      </Grid>

      {/* Account Details: Wallet Address, Registered Email, Wallet Balance, Open Offramp Intent */}
      <AccountDetails
        icon={WalletIcon}
        label="WALLET ADDRESS"
        value={formatAddress(account)}
        infoItemStyle={infoItemStyle}
      />
      <Divider sx={{ marginY: theme.spacing(4) }} />
      <AccountDetails
        icon={MailIcon}
        label="REGISTERED EMAIL"
        value={registeredEmail || "No email registered"}
        infoItemStyle={infoItemStyle}
      />
      <Divider sx={{ marginY: theme.spacing(4) }} />
      <AccountDetails
        icon={CashIcon}
        label="WALLET BALANCE"
        value={formatBalance(balance)}
        infoItemStyle={infoItemStyle}
      />
      <Divider sx={{ marginY: theme.spacing(4) }} />
      <AccountDetails
        icon={PendingIcon}
        label="OPEN OFFRAMP INTENTS"
        value={formatOffRampIntent(usersOffRampIntent)}
        infoItemStyle={infoItemStyle}
      />
      <Divider sx={{ marginY: theme.spacing(4) }} />
      <AccountDetails
        icon={PendingIcon}
        label="PENDING OFFRAMP INTENTS"
        value={formatOffRampIntent(usersPendingOffRampIntents)}
        infoItemStyle={infoItemStyle}
      />

      {/* Error handling Snackbar */}
      <ErrorSnackbar
        open={open}
        handleClose={handleErrorClose}
        errorMessage={error}
      />
    </div>
  );
};

// Header component with account title
const TypographyHeader = () => (
  <Box>
    <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
      ACCOUNT
    </Typography>
    <Typography variant="subtitle1" color="textSecondary">
      Overview of account details
    </Typography>
  </Box>
);

// Logout button component
const LogoutButton = ({ loading, handleLogout }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <Button
        color="primary"
        onClick={handleLogout}
        sx={{
          color: "#1B6AC8",
          fontSize: "20px",
          textTransform: "none",
          "&:hover": { backgroundColor: "white" },
        }}
      >
        LOGOUT
      </Button>
    )}
  </Box>
);

// Logout button component
const RefreshButton = ({ loading, handleRefresh }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <RefreshIcon
        color="primary"
        onClick={handleRefresh}
        sx={{
          color: "#1B6AC8",
          fontSize: "40px",
          textTransform: "none",
          "&:hover": { backgroundColor: "#bbdef8" },
        }}
      ></RefreshIcon>
    )}
  </Box>
);

// Formats the wallet address for display
const formatAddress = (address) =>
  address
    ? `0x...${address.substring(address.length - 4)}`
    : "No wallet address";

// Formats the wallet balance for display
const formatBalance = (balance) =>
  Number.isNaN(parseFloat(balance))
    ? "Error loading balance"
    : `ETH ${balance}`;

// Formats the offramp intent for display
const formatOffRampIntent = (intent) =>
  isNaN(parseFloat(intent)) ? "Error loading offramp intent" : `ETH ${intent}`;

// Component to display account details with an icon
const AccountDetails = ({ icon, label, value, infoItemStyle }) => (
  <Grid container alignItems="center" spacing={2} sx={{ marginBottom: 1 }}>
    <Grid item>
      <img
        src={icon}
        alt={`${label} Icon`}
        style={{ width: "50%", height: "50%" }}
      />
    </Grid>
    <Grid item xs>
      <Typography variant="caption" display="block" sx={{ marginBottom: 1 }}>
        {label}
      </Typography>
      <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
        <Box sx={infoItemStyle}>
          <Typography
            variant="body2"
            component="span"
            sx={{ color: "inherit" }}
            padding="10px"
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  </Grid>
);

export default UserAccount;
