import React from "react";
import {
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EmailIcon from "@mui/icons-material/Email";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAccount } from "../context/AccountContext";
import { useNavigate } from "react-router-dom";
import WalletIcon from "../icons/icons8-brieftasche-48.png"; // Import the PNG file
import MailIcon from "../icons/icons8-neuer-beitrag-48.png"; // Import the PNG file
import CashIcon from "../icons/icons8-münzen-48.png"; // Import the PNG file

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
    setOpenOffRampsInQueue

    
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
        p: theme.spacing(4),
        maxWidth: 500,
        mx: "auto",
        my: theme.spacing(3),
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
            marginBottom: 8, // Remove bottom margin for the title
          }}
        >
          Account Details
        </Typography>
        <Button
          color="primary"
          onClick={handleLogout}
          sx={{
            fontSize: theme.typography.body1.fontSize,
            fontWeight: "ultralight", // Ultra-light font weight
            marginBottom: 8, // Remove bottom margin for the title
            color: theme.palette.primary.main, // Primary color
          }}
        >
          Logout
        </Button>
      </Grid>

      <Grid
        container
        alignItems="center"
        spacing={2}
        sx={{ marginBottom: theme.spacing(1) }}
      >
        <Grid item>
          <img
            src={WalletIcon}
            alt="Wallet Icon"
            style={{ width: "50%", height: "50%" }}
          />
        </Grid>
        <Grid item xs>
          <Typography variant="caption" display="block" color="textSecondary">
            WALLET ADDRESS
          </Typography>
          <Typography variant="body1" color="textPrimary">
            {account}
          </Typography>
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
          <Typography variant="caption" display="block" color="textSecondary">
            REGISTERED EMAIL
          </Typography>
          <Typography variant="body1" color="textPrimary">
            {registeredEmail}
          </Typography>
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
          <Typography variant="caption" display="block" color="textSecondary">
            WALLET BALANCE
          </Typography>
          <Typography variant="body1" color="textPrimary">
            {balance}
          </Typography>
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
          <Typography variant="caption" display="block" color="textSecondary">
            OPEN OFFRAMP INTENT
          </Typography>
          <Typography variant="body1" color="textPrimary">
            ${usersOffRampIntent}
          </Typography>
        </Grid>
      </Grid>
      
    </Paper>
  );
};

export default UserAccount;
