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

/**
 * UserAccount Component
 *
 * This component displays user account information and provides functionality
 * for logging out and refreshing account data.
 */
const UserAccount = () => {
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
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
    setUsersPendingOffRampIntents,
  } = useAccount();

  useEffect(() => {
    if (account && logged) {
      fetchData();
    }
  }, [account, logged]);

  /**
   * Fetches user account data from the server
   */
  const fetchData = async () => {
    setRefreshLoading(true);
    try {
      const accountInfo = await getAccountInfo(account);
      setBalance(accountInfo.returnedBalance);
      setRegisteredEmail(accountInfo.returnedRegisteredEmail);
      setOpenOffRampsInQueue(accountInfo.returnedOpenOffRampsInQueue);
      setUsersOffRampIntent(accountInfo.returnedUsersOffRampIntent);
      setUsersPendingOffRampIntents(
        accountInfo.returnedUsersPendingOffRampIntents
      );
    } catch (error) {
      showError(error.message);
    } finally {
      setRefreshLoading(false);
    }
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    setLoading(true);
    // Simulate logout process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Reset user data
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
    return <LoginCard />;
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
          open={!!error}
          handleClose={() => showError(null)}
          errorMessage={error}
        />
      </Paper>
    </div>
  );
};

/**
 * LogoutButton Component
 * Renders a logout button or loading indicator
 */
const LogoutButton = ({ loading, handleLogout }) => (
  <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <Button
        color="error"
        onClick={handleLogout}
        sx={{
          color: "#8B0000",
          fontSize: "16px",
          textTransform: "none",
          "&:hover": { backgroundColor: "#FFA07A" },
        }}
      >
        LOGOUT
      </Button>
    )}
  </Box>
);

/**
 * RefreshButton Component
 * Renders a refresh button or loading indicator
 */
const RefreshButton = ({ loading, handleRefresh }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    {loading ? (
      <CircularProgress size={24} />
    ) : (
      <RefreshIcon
        color="error"
        onClick={handleRefresh}
        sx={{
          color: "#8B0000",
          fontSize: "24px",
          cursor: "pointer",
          "&:hover": { backgroundColor: "#FFA07A" },
        }}
      />
    )}
  </Box>
);

/**
 * Formats the wallet address for display
 * @param {string} address - The full wallet address
 * @returns {string} Formatted address or placeholder text
 */
const formatAddress = (address) =>
  address ? `0x...${address.slice(-4)}` : "No wallet address";

/**
 * Formats the balance for display
 * @param {string|number} balance - The account balance
 * @returns {string} Formatted balance or error message
 */
const formatBalance = (balance) =>
  Number.isNaN(parseFloat(balance))
    ? "Error loading balance"
    : `ETH ${balance}`;

/**
 * AccountDetail Component
 * Renders a single account detail with a label and value
 */
const AccountDetail = ({ label, value }) => (
  <Stack direction="row" spacing={4}>
    <Box width={200} textAlign="right">
      <CustomTypographyLabel value={label} />
    </Box>
    <CustomTypographyValue value={value} />
  </Stack>
);

export default UserAccount;
