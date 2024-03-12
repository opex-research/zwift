import React from "react";
import {
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  useTheme,
  Box,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAccount } from "../context/AccountContext";
import { useNavigate } from "react-router-dom";
import WalletIcon from "../icons/icons8-brieftasche-48.png"; // Import the PNG file
import MailIcon from "../icons/icons8-neuer-beitrag-48.png"; // Import the PNG file
import CashIcon from "../icons/icons8-münzen-48.png"; // Import the PNG file
import PendingIcon from "../icons/icons8-gegenwart-48.png"; // Import the PNG file

const UserAccount = () => {
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
  } = useAccount();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    setLogged(false);
    setAccount(null);
    setBalance();
    setRegisteredEmail("");
    setUsersOffRampIntent(0);
    setOpenOffRampsInQueue(0);
    navigate("/");
  };

  return (
    <Paper
      elevation={1}
      sx={{
        width: "100%",
        maxWidth: "600px",
        height: "600px", // Fixed height
        p: theme.spacing(4),
        borderRadius: 4,
        flexDirection: "column",
        alignItems: "center",
        m: 2, // Adjust margin to ensure consistency
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between" // Align items and button to opposite ends
        sx={{ marginBottom: theme.spacing(2) }} // Reduce bottom margin for the grid
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "medium",
            marginBottom: 4, // Remove bottom margin for the title
          }}
        >
          ACCOUNT
        </Typography>
        <Button
          color="primary"
          onClick={handleLogout}
          sx={{
            color: "#1B6AC8",
            fontSize: "20px",
            display: "flex",
            justifyContent: "flex-start",
            textTransform: "none",
            marginBottom: 8,
            "&:hover": {
              backgroundColor: "white",
            },
          }}
        >
          Logout
        </Button>
      </Grid>
      {/* Wallet Address Section */}
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ marginBottom: theme.spacing(1) }}
      >
        {/* Icon */}
        <Grid item>
          <img
            src={WalletIcon}
            alt="Wallet Icon"
            style={{ width: "50%", height: "50%" }}
          />
        </Grid>
        {/* Address Label and Value */}
        <Grid item xs>
          <Typography
            variant="caption"
            display="block"
            color="textSecondary"
            sx={{ marginBottom: 1 }}
          >
            WALLET ADDRESS
          </Typography>
          <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: 25,
                borderRadius: "10px",
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                padding: theme.spacing(0, 1),
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
                padding="10px"
              >
                {account}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: theme.spacing(4) }} />

      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ marginBottom: theme.spacing(1) }}
      >
        <Grid item>
          <img
            src={MailIcon}
            alt="Mail Icon"
            style={{ width: "50%", height: "50%" }}
          />
        </Grid>
        <Grid item xs>
          <Typography
            variant="caption"
            display="block"
            color="textSecondary"
            sx={{ marginBottom: 1 }}
          >
            REGISTERED EMAIL
          </Typography>
          <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: 25,
                borderRadius: "10px",
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                padding: theme.spacing(0, 1),
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
                padding="10px"
              >
                {registeredEmail}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: theme.spacing(4) }} />
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ marginBottom: theme.spacing(1) }}
      >
        <Grid item>
          <img
            src={CashIcon}
            alt="Cash Icon"
            style={{ width: "50%", height: "50%" }}
          />
        </Grid>
        <Grid item xs>
          <Typography
            variant="caption"
            display="block"
            color="textSecondary"
            sx={{ marginBottom: 1 }}
          >
            WALLET BALANCE
          </Typography>
          <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: 25,
                borderRadius: "10px",
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                padding: theme.spacing(0, 1),
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
                padding="10px"
              >
                ETH {balance}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ marginY: theme.spacing(4) }} />
      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ marginBottom: theme.spacing(1) }}
      >
        <Grid item>
          <img
            src={PendingIcon}
            alt="Pending Icon"
            style={{ width: "50%", height: "50%" }}
          />
        </Grid>
        <Grid item xs>
          <Typography
            variant="caption"
            display="block"
            color="textSecondary"
            sx={{ marginBottom: 1 }}
          >
            OPEN OFFRAMP INTENT
          </Typography>
          <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                height: 25,
                borderRadius: "10px",
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                padding: theme.spacing(0, 1),
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
                padding="10px"
              >
                ${usersOffRampIntent}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserAccount;
