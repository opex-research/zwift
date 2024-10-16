import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar";
import ActionButton from "./ActionButton";
import { Paper, Box, Stack } from "@mui/material";
import CustomTypographyLabel from "./EssentialComponents/CustomTypographyLabel";
import CustomButton from "./EssentialComponents/CustomButton";
import LoadingAccount from "./LoadingAccount";
import LoginIcon from "@mui/icons-material/Login";

import {
  loginUserAccount,
  registerUserAccount,
  loginWithMetaMask,
} from "../services/OrchestratorLoginService";
import {
  getRegistrationStatusFromDatabase,
  simulateRegistrationChangeToSuccess,
} from "../services/DatabaseService";

/**
 * LoginCard Component
 *
 * This component handles user authentication and registration.
 * It manages the flow between connecting to MetaMask, registering a new account,
 * and logging in an existing user.
 */
const LoginCard = () => {
  const navigate = useNavigate();
  const {
    setAccount,
    setLogged,
    metaMaskLogged,
    setMetaMaskLogged,
    setPaypalEmail,
    paypalEmail: initialPaypalEmail,
  } = useAccount();
  const isLocal = process.env.REACT_APP_IS_LOCAL === "TRUE";
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("not_connected");
  const { error, showError } = useErrorHandler();
  const [metaMaskAccountHelperAddress, setMetaMaskAccountHelperAddress] =
    useState(null);
  const intervalRef = useRef(null);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);

  // Initialize paypalEmail from sessionStorage or context
  const [paypalEmail, setLocalPaypalEmail] = useState(
    () => sessionStorage.getItem("paypalEmail") || initialPaypalEmail
  );

  // Sync paypalEmail updates to sessionStorage
  useEffect(() => {
    if (paypalEmail) {
      sessionStorage.setItem("paypalEmail", paypalEmail);
    } else {
      sessionStorage.removeItem("paypalEmail");
    }
  }, [paypalEmail]);

  // Fetch registration status when MetaMask is connected
  useEffect(() => {
    if (metaMaskLogged && metaMaskAccountHelperAddress) {
      fetchRegistrationStatus();
    }
  }, [metaMaskLogged, paypalEmail, metaMaskAccountHelperAddress]);

  // Check registration status periodically if pending
  useEffect(() => {
    if (registrationStatus === "pending") {
      intervalRef.current = setInterval(
        checkAndUpdateRegistrationStatus,
        100000
      );
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [registrationStatus, paypalEmail]);

  // Reset registration attempt flag when relevant states change
  useEffect(() => {
    setRegistrationAttempted(false);
  }, [paypalEmail, registrationStatus]);

  // Attempt registration if conditions are met
  useEffect(() => {
    if (
      paypalEmail &&
      registrationStatus === "not_registered" &&
      !registrationAttempted
    ) {
      handleSignUp();
      setRegistrationAttempted(true);
    }
  }, [paypalEmail, registrationStatus, registrationAttempted]);

  /**
   * Fetches the user's registration status from the database
   */
  const fetchRegistrationStatus = async () => {
    try {
      if (metaMaskAccountHelperAddress) {
        const status = await getRegistrationStatusFromDatabase(
          metaMaskAccountHelperAddress
        );
        setRegistrationStatus(status);
        if (status === "registered") {
          handleLogin();
        }
      }
    } catch (error) {
      showError(error.message);
    }
  };

  /**
   * Checks and updates the registration status
   */
  const checkAndUpdateRegistrationStatus = async () => {
    try {
      if (metaMaskAccountHelperAddress) {
        const newStatus = await getRegistrationStatusFromDatabase(
          metaMaskAccountHelperAddress
        );
        setRegistrationStatus(newStatus);
        if (newStatus === "registered") {
          clearInterval(intervalRef.current);
          handleLogin();
        }
      }
    } catch (error) {
      showError(error.message);
    }
  };

  /**
   * Handles MetaMask connection
   */
  const handleMetaMaskConnection = async () => {
    setLoading(true);
    try {
      const account = await loginWithMetaMask();
      if (account) {
        setMetaMaskLogged(true);
        setAccount(account);
        setMetaMaskAccountHelperAddress(account);
        fetchRegistrationStatus();
      }
    } catch (err) {
      showError(err.message || "Failed to connect to MetaMask.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user login
   */
  const handleLogin = async () => {
    try {
      const userAccount = await loginUserAccount();
      setLogged(true);
      setAccount(userAccount);
      navigate("/");
    } catch (err) {
      showError(err.message || "Login failed.");
    }
  };

  /**
   * Handles user registration
   */
  const handleSignUp = async () => {
    if (paypalEmail) {
      try {
        const userAccount = await registerUserAccount(paypalEmail);
        setRegistrationStatus("pending");
        setAccount(userAccount);
        setLocalPaypalEmail(paypalEmail);
      } catch (err) {
        showError(err.message || "Registration failed.");
      }
    }
  };

  /**
   * Simulates a successful registration (for local development only)
   */
  const handleRegistrationSuccessSimulation = async () => {
    try {
      await simulateRegistrationChangeToSuccess(metaMaskAccountHelperAddress);
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
    }
  };

  if (loading) {
    return <LoadingAccount />;
  }

  return (
    <Paper
      sx={{
        padding: 4,
        background: "black",
        color: "white",
        borderRadius: "12px",
        margin: "auto",
        minWidth: 550,
        maxWidth: 700,
        boxShadow:
          "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.19)",
      }}
      elevation={4}
    >
      <Stack spacing={3}>
        {isLocal && (
          <CustomButton
            onClick={handleRegistrationSuccessSimulation}
            buttonText="Simulate a server check that confirms transaction"
          />
        )}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LoginIcon sx={{ mr: 2, color: "gray", fontSize: 24 }} />
          <CustomTypographyLabel value="authenticate yourself" />
        </Box>
        <ActionButton
          status={registrationStatus}
          onConnect={handleMetaMaskConnection}
          onRegister={handleSignUp}
          metaMaskLogged={metaMaskLogged}
          email={paypalEmail}
        />
        <ErrorSnackbar
          open={!!error}
          handleClose={() => showError(null)}
          errorMessage={error}
        />
      </Stack>
    </Paper>
  );
};

export default LoginCard;
