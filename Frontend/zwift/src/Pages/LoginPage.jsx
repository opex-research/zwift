import React from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import {
  loginWithMetaMask,
  getAccountBalance,
} from "../services/MetaMaskService";
import {
  Button,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Logo from "../logo_zwift.webp"; // Replace with the path to your logo file

function LoginPage() {
  const navigate = useNavigate();
  const { setAccount, setBalance, setLogged } = useAccount();

  const handleLogin = async () => {
    const account = await loginWithMetaMask();
    if (account) {
      setLogged(true);
      setAccount(account);

      const balance = await getAccountBalance(account);
      if (balance) setBalance(balance);

      navigate("/dashboard");
    }
  };

  // Define a nicer blue color for the line and the button
  const niceBlueColor = "#89CFF0";

  return (
    <Paper
      elevation={4}
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #83a4d4, #b6fbff)",
      }}
    >
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
                alignSelf: "flex-start", // Align the button with the text above
              }}
            >
              Log In with MetaMask
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
}

export default LoginPage;
