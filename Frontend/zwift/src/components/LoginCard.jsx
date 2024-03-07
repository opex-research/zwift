import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import useErrorHandler from "../hooks/useErrorHandler";
import LoginIcon from "../icons/icons8-eintreten-48.png";
import SignUpIcon from "../icons/icons8-anmelden-48.png";
import Logo from "../logo_zwift.webp";

import {
  getOpenOffRampIntentsFromQueue,
  getUsersOpenOffRampIntents,
} from "../services/OrchestratorOffRampService";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  TextField,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";

import {
  loginUserAccount,
  registerUserAccount,
  getAccountBalance,
  getUserEmail,
} from "../services/OrchestratorLoginService";

const LoginCard = () => {
  const navigate = useNavigate();
  const {
    setAccount,
    setBalance,
    setLogged,
    setRegisteredEmail,
    openOffRampsInQueue,
    setOpenOffRampsInQueue,
    usersOffRampIntent,
    setUsersOffRampIntent,
  } = useAccount();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const { error, showError } = useErrorHandler();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleLogin = async () => {
    try {
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
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setOpen(true);
    }
  };

  const handleSignUp = async () => {
    if (email !== confirmEmail) {
      showError("Emails do not match!");
      setOpen(true);
      return;
    }
    try {
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
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.message || "An unexpected error occurred.");
      setOpen(true);
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 700,
        mx: "auto",
        borderRadius: 4,
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Box sx={{ width: "100%", p: 2 }}>
        <CardContent>
          <Grid item xs={7} md={7}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "medium", marginBottom: 4 }}
            >
              LOG-IN
            </Typography>
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
                <Typography
                  variant="caption"
                  sx={{ color: "grey", display: "block" }}
                >
                  RETURNING USERS CAN
                </Typography>

                <Button
                  onClick={handleLogin}
                  sx={{
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
                  }}
                >
                  LOGIN
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ marginBottom: 4 }} />
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "medium", marginBottom: 4 }}
            >
              REGISTER
            </Typography>
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
                <Typography
                  variant="caption"
                  sx={{ color: "grey", display: "block" }}
                >
                  FIRST TIME HERE, SET YOUR PAYPAL EMAIL
                </Typography>

                <TextField
                  required
                  fullWidth
                  value={email}
                  variant="standard"
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />

                <Typography
                  variant="caption"
                  sx={{ color: "grey", display: "block" }}
                >
                  CONFIRM EMAIL
                </Typography>

                <TextField
                  required
                  fullWidth
                  value={confirmEmail}
                  variant="standard"
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />

                <Button
                  onClick={handleSignUp}
                  sx={{
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
                  }}
                >
                  REGISTER
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              {error}
            </Alert>
          </Snackbar>
        </CardContent>
      </Box>
    </Card>
  );
};

export default LoginCard;
