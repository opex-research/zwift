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
import CustomButton from "./EssentialComponents/CustomButton";
import CustomTypographyLabel from "./EssentialComponents/CustomTypographyLabel";
import CustomTypographyValue from "./EssentialComponents/CustomTypographyValue";
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
            <RefreshButton
              loading={refreshLoading}
              handleRefresh={handleRefresh}
            />
            <LogoutButton loading={loading} handleLogout={handleLogout} />
          </Box>
          <Stack spacing={1}>
            <AccountDetail
              label="wallet address"
              value={formatAddress(account)}
            />
            <AccountDetail
              label="email address"
              value={registeredEmail || "No email registered"}
            />
            <AccountDetail
              label="wallet balance"
              value={formatBalance(balance)}
            />
            <AccountDetail label="open offramps" value={usersOffRampIntent} />
          </Stack>
        </Stack>
        <ErrorSnackbar
          open={open}
          handleClose={handleErrorClose}
          errorMessage={error}
        />
      </Paper>
    </div>
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
  <Stack direction="row" spacing={4}>
    <Box width={200} textAlign="right">
      <CustomTypographyLabel value={label}></CustomTypographyLabel>
    </Box>
    <CustomTypographyValue value={value}></CustomTypographyValue>
  </Stack>
);

export default UserAccount;
