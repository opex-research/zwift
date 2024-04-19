import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Paper,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar";
import RefreshIcon from "@mui/icons-material/Refresh";
import { getAccountInfo } from "../services/AccountInfoService";

const UserAccount = () => {
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
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
        } = await getAccountInfo(account);
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
      }
    };

    if (account) {
      fetchData();
    }
  }, [account]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await delay(2000);
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
      } = await getAccountInfo(account);
      if (returnedBalance) setBalance(returnedBalance);
      if (returnedRegisteredEmail) setRegisteredEmail(returnedRegisteredEmail);
      if (returnedOpenOffRampsInQueue)
        setOpenOffRampsInQueue(returnedOpenOffRampsInQueue);
      if (returnedUsersOffRampIntent)
        setUsersOffRampIntent(returnedUsersOffRampIntent);
      if (returnedUsersPendingOffRampIntents)
        setUsersPendingOffRampIntents(returnedUsersPendingOffRampIntents);
      setRefreshLoading(false);
    } catch (error) {
      console.error("Error fetching account info:", error);
      showError(error.message || "An unexpected error occurred.");
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        background: "#000",
        color: "#FFF",
        borderRadius: "12px",
        margin: "auto",
        maxWidth: "calc(100vw - 32px)",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">ACCOUNT</Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <RefreshButton
            loading={refreshLoading}
            handleRefresh={handleRefresh}
          />
          <LogoutButton loading={loading} handleLogout={handleLogout} />
        </Box>
      </Stack>

      <Stack spacing={1}>
        <AccountDetail label="wallet address" value={formatAddress(account)} />
        <AccountDetail
          label="email address"
          value={registeredEmail || "No email registered"}
        />
        <AccountDetail label="wallet balance" value={formatBalance(balance)} />
        <AccountDetail
          label="open offramp intents"
          value={usersOffRampIntent}
        />
      </Stack>

      <ErrorSnackbar
        open={open}
        handleClose={handleErrorClose}
        errorMessage={error}
      />
    </Paper>
  );
};

const LogoutButton = ({ loading, handleLogout }) => (
  <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <Button
        color="error"
        onClick={handleLogout}
        sx={{
          color: "#8B0000", // Dark red color
          fontSize: "16px",
          textTransform: "none",
          "&:hover": { backgroundColor: "#FFA07A" }, // Light red hover color
        }}
      >
        LOGOUT
      </Button>
    )}
  </Box>
);

const RefreshButton = ({ loading, handleRefresh }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <RefreshIcon
        color="error"
        onClick={handleRefresh}
        sx={{
          color: "#8B0000", // Dark red color
          fontSize: "24px",
          "&:hover": { backgroundColor: "#FFA07A" }, // Light red hover color
        }}
      />
    )}
  </Box>
);

const formatAddress = (address) =>
  address
    ? `0x...${address.substring(address.length - 4)}`
    : "No wallet address";

const formatBalance = (balance) =>
  Number.isNaN(parseFloat(balance))
    ? "Error loading balance"
    : `ETH ${balance}`;

const AccountDetail = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      color: "#FFF",
      padding: "8px 0",
      margin: "4px 0",
    }}
  >
    <Typography variant="body2">{label}</Typography>
    <Box sx={{ backgroundColor: "grey", p: 1, borderRadius: 1 }}>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

export default UserAccount;
