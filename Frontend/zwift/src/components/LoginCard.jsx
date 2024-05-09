import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar";
import ActionButton from "./ActionButton";
import RegistrationButtons from "./RegistrationButtons";
import { Paper, Box, Stack, CircularProgress } from "@mui/material";
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
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState("");
  const { error, showError } = useErrorHandler();
  const [metaMaskAccountHelperAddress, setMetaMaskAccountHelperAddress] =
    useState(null);
  const intervalRef = useRef(null);
  const [registrationAttempted, setRegistrationAttempted] = useState(false);

  // Initialize paypalEmail from sessionStorage or context
  const [paypalEmail, setLocalPaypalEmail] = useState(
    () => sessionStorage.getItem("paypalEmail") || initialPaypalEmail
  );

  // Effect to sync paypalEmail updates to sessionStorage
  useEffect(() => {
    if (paypalEmail) {
      sessionStorage.setItem("paypalEmail", paypalEmail);
    } else {
      sessionStorage.removeItem("paypalEmail");
    }
  }, [paypalEmail]);

  useEffect(() => {
    if (metaMaskLogged && metaMaskAccountHelperAddress) {
      fetchRegistrationStatus();
    } else {
      setRegistrationStatus("not_connected");
    }
  }, [metaMaskLogged, paypalEmail, metaMaskAccountHelperAddress]);

  useEffect(() => {
    if (registrationStatus === "pending") {
      intervalRef.current = setInterval(
        checkAndUpdateRegistrationStatus,
        100000
      );
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [registrationStatus, paypalEmail]);

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

  useEffect(() => {
    setRegistrationAttempted(false);
  }, [paypalEmail, registrationStatus]);

  useEffect(() => {
    if (
      paypalEmail &&
      registrationStatus === "not_registered" &&
      !registrationAttempted
    ) {
      handleSignUp();
      setRegistrationAttempted(true);
    }
  }, [paypalEmail, registrationStatus, registrationAttempted, handleSignUp]);

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
        <CustomButton
          onClick={handleRegistrationSuccessSimulation}
          buttonText="Simulate a server check that confirms transaction"
        />
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
