import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import ErrorSnackbar from "../components/ErrorSnackbar"; // Adjust the path as necessary
import CircularProgress from "@mui/material/CircularProgress";

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
  const [loading, setLoading] = useState(false);
  const {
    setAccount,
    setBalance,
    setLogged,
    setRegisteredEmail,
    setOpenOffRampsInQueue,
    setUsersOffRampIntent,
  } = useAccount();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const { error, showError } = useErrorHandler();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  // Utility function to simulate network delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Handles closing of Snackbar
  const handleErrorClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  // Handles login logic with error handling and loading state
  const handleLogin = async () => {
    setLoading(true);
    try {
      await delay(2000); // Simulate network delay
      const account = await loginUserAccount();
      if (account) {
        setLogged(true);
        setAccount(account);
        const balance = await getAccountBalance(account);
        if (balance) setBalance(balance);
        const registeredEmail = await getUserEmail(account);
        if (registeredEmail) setRegisteredEmail(registeredEmail);
        const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
        if (openOffRampsInQueue) setOpenOffRampsInQueue(openOffRampsInQueue);
        const usersOffRampIntent = await getUsersOpenOffRampIntents(account);
        if (usersOffRampIntent) setUsersOffRampIntent(usersOffRampIntent);

        setLoading(false); // Stop loading on success
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setLoading(false);
      setOpen(true);
    }
  };

  // Handles sign-up logic with error handling and loading state
  const handleSignUp = async () => {
    setLoading(true);
    try {
      await delay(2000); // Simulate network delay

      const account = await registerUserAccount(email);
      if (account) {
        setLogged(true);
        setAccount(account);
        const balance = await getAccountBalance(account);
        if (balance) setBalance(balance);
        const registeredEmail = await getUserEmail(account);
        if (registeredEmail) setRegisteredEmail(registeredEmail);
        const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
        if (openOffRampsInQueue) setOpenOffRampsInQueue(openOffRampsInQueue);
        const usersOffRampIntent = await getUsersOpenOffRampIntents(account);
        if (usersOffRampIntent) setUsersOffRampIntent(usersOffRampIntent);

        setLoading(false); // Stop loading on success
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setLoading(false);
      setOpen(true);
    }
  };

  // Render a loading spinner when the component is in a loading state
  if (loading) {
    return <CircularProgress />;
  }

  // Main component UI
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
          <SignUpSection
            email={email}
            setEmail={setEmail}
            confirmEmail={confirmEmail}
            setConfirmEmail={setConfirmEmail}
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
  const isFormValid =
    email === confirmEmail && isValidEmail(email) && isValidEmail(confirmEmail);

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
        <Typography variant="caption" sx={{ color: "grey", display: "block" }}>
          FIRST TIME HERE, SET YOUR PAYPAL EMAIL
        </Typography>
        <TextField
          required
          fullWidth
          value={email}
          variant="standard"
          onChange={(e) => setEmail(e.target.value)}
          error={email && !isValidEmail(email)}
          helperText={
            email && !isValidEmail(email) ? "Please enter a valid email." : ""
          }
          sx={{ marginBottom: 2 }}
        />
        <Typography variant="caption" sx={{ color: "grey", display: "block" }}>
          CONFIRM EMAIL
        </Typography>
        <TextField
          required
          fullWidth
          value={confirmEmail}
          variant="standard"
          onChange={(e) => setConfirmEmail(e.target.value)}
          error={confirmEmail && !isValidEmail(confirmEmail)}
          helperText={
            confirmEmail && !isValidEmail(confirmEmail)
              ? "Please enter a valid email."
              : ""
          }
          sx={{ marginBottom: 2 }}
        />
        <Button onClick={handleSignUp} disabled={!isFormValid} sx={buttonStyle}>
          REGISTER
        </Button>
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
