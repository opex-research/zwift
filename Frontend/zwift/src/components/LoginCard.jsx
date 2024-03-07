import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import {
  loginUserAccount,
  registerUserAccount,
  getAccountBalance,
  getUserEmail,
} from "../services/OrchestratorLoginService";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  TextField,
} from "@mui/material";
import Logo from "../logo_zwift.webp"; // Adjust path as necessary

const LoginCard = () => {
  const navigate = useNavigate();
  const { setAccount, setBalance, setLogged, setRegisteredEmail } =
    useAccount();
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const niceBlueColor = "#89CFF0";

  const handleLogin = async () => {
    const account = await loginUserAccount();
    if (account) {
      setLogged(true);
      setAccount(account);

      const balance = await getAccountBalance(account);
      if (balance) setBalance(balance);

      const registeredEmail = await getUserEmail(account);
      if (registeredEmail) setRegisteredEmail(registeredEmail);

      navigate("/dashboard");
    }
  };

  const handleSignUp = async () => {
    if (email !== confirmEmail) {
      alert("Emails do not match!");
      return;
    }

    const account = await registerUserAccount(email);
    if (account) {
      setLogged(true);
      setAccount(account);

      const balance = await getAccountBalance(account);
      if (balance) setBalance(balance);

      const registeredEmail = await getUserEmail(account);
      if (registeredEmail) setRegisteredEmail(registeredEmail);

      navigate("/dashboard");
    }
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 2, borderRadius: 4 }}>
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginRight: "20px",
          }}
        >
          <img src={Logo} alt="Logo" style={{ height: "100px" }} />
        </Box>
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            borderColor: niceBlueColor,
            borderWidth: "thin",
            marginRight: "20px",
            minHeight: "calc(100% - 16px)",
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ color: "black", fontWeight: "300", marginBottom: "8px" }}
          >
            Welcome to Zwift
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: "grey", fontWeight: "300", marginBottom: "20px" }}
          >
            Log in to your account to continue
          </Typography>
          <Button
            type="button"
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{
              backgroundColor: niceBlueColor,
              "&:hover": { backgroundColor: niceBlueColor },
              alignSelf: "flex-start",
              marginBottom: "20px",
            }}
          >
            Log In with MetaMask
          </Button>
          <Typography
            variant="subtitle1"
            sx={{ color: "grey", fontWeight: "300", marginBottom: "20px" }}
          >
            First time here? Sign up:
          </Typography>
          <TextField
            label="Your PayPal email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Directly use setEmail here
            sx={{ marginBottom: "15px" }}
          />
          <TextField
            label="Confirm email"
            required
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            sx={{ marginBottom: "15px" }}
          />
          <Button
            type="button"
            variant="outlined"
            size="large"
            onClick={handleSignUp}
            sx={{
              color: niceBlueColor,
              "&:hover": { outlineColor: niceBlueColor },
              alignSelf: "flex-start",
              marginBottom: "20px",
            }}
          >
            Sign up and connect Wallet
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoginCard;
