import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar"; // Adjust the path as necessary
import LoadingMessage from "./LoadingMessage"; // Adjust the path as necessary
import RegistrationButtons from "./RegistrationButtons";
import {
  getRegistrationStatusFromDatabase,
  simulateRegistrationChangeToSuccess,
} from "../services/DatabaseService";
// Importing UI components from MUI
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
  useTheme,
} from "@mui/material";

// Importing login service functions
import {
  loginUserAccount,
  registerUserAccount,
  getAccountBalance,
  getUserEmail,
  loginWithMetaMask,
} from "../services/OrchestratorLoginService";

// Importing offramp service functions
import {
  getOpenOffRampIntentsFromQueue,
  getUsersOpenOffRampIntents,
} from "../services/OrchestratorOffRampService";

// Importing icons and logo
import LoginIcon from "../icons/icons8-eintreten-48.png";
import SignUpIcon from "../icons/icons8-anmelden-48.png";

// Utility function to check if the email is valid
const isValidEmail = (email) => {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

/**
 * LoginCard Component
 * Displays authentication panel for registering and login.
 */
const LoginCard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({ isActive: false, message: "" });

  //WE do need this to query the database with the right wallet address, this is however not yet the account address that we user
  // in the context for everything else
  const [metaMaskAccountHelperAddress, setMetaMaskAccountHelperAddress] =
    useState(null);

  const {
    account,
    setAccount,
    setBalance,
    setLogged,
    setRegisteredEmail,
    setOpenOffRampsInQueue,
    setUsersOffRampIntent,
    metaMaskLogged,
    setMetaMaskLogged,
  } = useAccount();
  const { paypalEmail, setPaypalEmail } = useAccount();
  const [email, setEmail] = useState(paypalEmail || "");

  const { error, showError } = useErrorHandler();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  //Check registration
  const [registrationStatus, setRegistrationStatus] =
    useState("not_registered"); //not_registered, pending, registered

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      if (metaMaskLogged) {
        // Only fetch registration status if metaMaskLogged is true
        try {
          const status = await getRegistrationStatusFromDatabase(
            metaMaskAccountHelperAddress
          );
          setRegistrationStatus(status); // Update state based on the fetched status
        } catch (error) {
          // Handle any errors that occur during the fetch
          console.error("Failed to fetch registration status:", error);
          showError("Failed to check registration status.");
        }
      }
    };

    fetchRegistrationStatus();
  }, [metaMaskLogged]); // This effect depends on metaMaskLogged

  // Utility function to simulate network delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const withTimeout = (promise, timeout) => {
    return new Promise((resolve, reject) => {
      // Set a timer that rejects the promise after timeout
      const timer = setTimeout(() => {
        reject(new Error("Operation timed out"));
      }, timeout);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };

  // Handles closing of Snackbar
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // Handles closing of Snackbar
  const handleMetaMaskConnection = async () => {
    try {
      const account = await loginWithMetaMask();
      if (account) {
        setMetaMaskLogged(true);
        setMetaMaskAccountHelperAddress(account);
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setOpen(true);
    }
  };

  // Handles login logic with error handling and loading state
  const handleLogin = async () => {
    setLoading({ isActive: true, message: "LOGGING YOU IN" });
    try {
      const account = await loginUserAccount();
      if (account) {
        setLogged(true);
        setAccount(account);
        setLoading({ isActive: false, message: "" });
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setLoading({ isActive: false, message: "" });
      setOpen(true);
    }
  };

  const handleRegistrationSuccessSimulation = async () => {
    try {
      await simulateRegistrationChangeToSuccess(metaMaskAccountHelperAddress);
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
    }
  };

  // Handles sign-up logic with error handling and loading state
  const handleSignUp = async () => {
    setLoading({ isActive: true, message: "REGISTERING YOU" });
    try {
      await registerUserAccount(email);
      setLoading({ isActive: false, message: "REGISTERING YOU" });
      setRegistrationStatus("pending");
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setLoading({ isActive: false, message: "" });
      setOpen(true);
    }
  };

  // Render a loading spinner when the component is in a loading state
  // Assuming `loading` is a state that tracks whether your component is loading
  if (loading.isActive) {
    return <LoadingMessage message={loading.message} />;
  }

  if (!metaMaskLogged) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Adjust the height as needed to center vertically
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleMetaMaskConnection}
        >
          Connect MetaMask
        </Button>
      </Box>
    );
  }

  if (registrationStatus == "not_registered" && metaMaskLogged) {
    return (
      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ paddingBottom: "8px !important", flexGrow: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "medium", marginBottom: 4 }}
            >
              AUTHENTICATION
            </Typography>
            <SignUpSection
              email={email}
              setEmail={setEmail}
              handleSignUp={handleSignUp}
              theme={theme}
            />
            <ErrorSnackbar
              open={open}
              handleClose={handleErrorClose}
              errorMessage={error}
            />
          </CardContent>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "black",
              fontSize: "0.75rem", // Same font size as the "Confirm Email" label
              fontWeight: 400, // Same font weight as the "Confirm Email" label
            }}
          >
            zwift | exchange with ease
          </Typography>{" "}
        </Box>
      </Card>
    );
  }

  if (registrationStatus == "pending" && metaMaskLogged) {
    return (
      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ paddingBottom: "8px !important", flexGrow: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "medium", marginBottom: 4 }}
            >
              Registration is pending
            </Typography>
            <Button onClick={handleRegistrationSuccessSimulation}>
              (Simulate a server check that confirms transaction)
            </Button>
            <ErrorSnackbar
              open={open}
              handleClose={handleErrorClose}
              errorMessage={error}
            />
          </CardContent>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "black",
              fontSize: "0.75rem", // Same font size as the "Confirm Email" label
              fontWeight: 400, // Same font weight as the "Confirm Email" label
            }}
          >
            zwift | exchange with ease
          </Typography>{" "}
        </Box>
      </Card>
    );
  }

  if (registrationStatus == "registered" && metaMaskLogged)
    return (
      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: "100%",
            p: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent sx={{ paddingBottom: "8px !important", flexGrow: 1 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "medium", marginBottom: 4 }}
            >
              AUTHENTICATION
            </Typography>
            <LoginSection handleLogin={handleLogin} theme={theme} />
            <Divider sx={{ marginBottom: 4 }} />

            <ErrorSnackbar
              open={open}
              handleClose={handleErrorClose}
              errorMessage={error}
            />
          </CardContent>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "black",
              fontSize: "0.75rem", // Same font size as the "Confirm Email" label
              fontWeight: 400, // Same font weight as the "Confirm Email" label
            }}
          >
            zwift | exchange with ease
          </Typography>{" "}
        </Box>
      </Card>
    );
};

// Login section component
const LoginSection = ({ handleLogin, theme }) => (
  <Grid
    container
    alignItems="center"
    spacing={2}
    sx={{ marginBottom: theme.spacing(2) }}
  >
    <Grid item>
      <img
        src={LoginIcon}
        alt="Login Icon"
        style={{ width: "50%", height: "50%" }}
      />
    </Grid>
    <Grid item xs>
      <Typography variant="caption" sx={{ color: "grey", display: "block" }}>
        RETURNING USERS CAN
      </Typography>
      <Button onClick={handleLogin} sx={buttonStyle}>
        LOGIN
      </Button>
    </Grid>
  </Grid>
);

// Sign up section component
const SignUpSection = ({
  email,
  setEmail,
  confirmEmail,
  setConfirmEmail,
  handleSignUp,
  theme,
}) => {
  // Check if both emails are valid and match
  const isFormValid = isValidEmail(email);

  return (
    <Grid
      container
      alignItems="flex-start"
      spacing={2}
      sx={{ marginBottom: theme.spacing(2) }}
    >
      <Grid item>
        <img
          src={SignUpIcon}
          alt="SignUp Icon"
          style={{ width: "50%", height: "50%" }}
        />
      </Grid>
      <Grid item xs>
        {email ? (
          <>
            <Typography
              variant="caption"
              sx={{ color: "grey", display: "block" }}
            >
              YOUR PAYPAL EMAIL
            </Typography>
            <TextField
              required
              fullWidth
              value={email}
              variant="standard"
              InputProps={{
                readOnly: true, // Make the TextField read-only
              }}
              sx={{ marginBottom: 2 }}
            />
            <Button
              onClick={handleSignUp}
              disabled={!isFormValid}
              sx={buttonStyle}
            >
              REGISTER
            </Button>
          </>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{ color: "grey", display: "block" }}
            >
              FIRST TIME HERE? LOG IN TO REGISTER YOUR PAYPAL EMAIL
            </Typography>
            <RegistrationButtons />
          </>
        )}
      </Grid>
    </Grid>
  );
};

// Button style reused in multiple components
const buttonStyle = {
  color: "#1B6AC8",
  fontSize: "20px",
  display: "flex",
  justifyContent: "flex-start",
  textTransform: "none",
  marginBottom: 1,
  "&:hover": {
    backgroundColor: "#47a7f5",
    color: "white",
  },
};

export default LoginCard;
