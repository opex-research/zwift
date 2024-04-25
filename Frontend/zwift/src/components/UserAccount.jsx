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
import LoginCard from "../components/LoginCard";

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
    logged,
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
    if (account && logged) {
      fetchData();
    }
  }, [account, logged]);

  const fetchData = async () => {
    try {
      const accountInfo = await getAccountInfo(account);
      setBalance(accountInfo.returnedBalance);
      setRegisteredEmail(accountInfo.returnedRegisteredEmail);
      setOpenOffRampsInQueue(accountInfo.returnedOpenOffRampsInQueue);
      setUsersOffRampIntent(accountInfo.returnedUsersOffRampIntent);
      setUsersPendingOffRampIntents(
        accountInfo.returnedUsersPendingOffRampIntents
      );
      setRefreshLoading(false);
    } catch (error) {
      showError(error.message);
      setRefreshLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLogged(false);
    setAccount(null);
    setBalance(null);
    setRegisteredEmail(null);
    setUsersOffRampIntent(0);
    setOpenOffRampsInQueue(0);
    setUsersPendingOffRampIntents(0);
    navigate("/");
    setLoading(false);
  };

  if (!logged) {
    // Show login card if not logged in
    return <LoginCard />;
  }

  // Show account details if logged in
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
            <RefreshButton loading={refreshLoading} handleRefresh={fetchData} />
            <LogoutButton loading={loading} handleLogout={handleLogout} />
          </Box>
          <Stack spacing={1}>
            <AccountDetail
              label="Wallet Address"
              value={formatAddress(account)}
            />
            <AccountDetail
              label="Email Address"
              value={registeredEmail || "No email registered"}
            />
            <AccountDetail
              label="Wallet Balance"
              value={formatBalance(balance)}
            />
            <AccountDetail label="Open Offramps" value={usersOffRampIntent} />
          </Stack>
        </Stack>
        <ErrorSnackbar
          open={open}
          handleClose={() => setOpen(false)}
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
