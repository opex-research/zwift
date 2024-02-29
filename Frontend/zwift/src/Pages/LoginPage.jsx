import React from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import {
  loginWithMetaMask,
  getAccountBalance,
} from "../services/MetaMaskService";
import { Paper } from "@mui/material";
import LoginCard from "../components/LoginCard"; // Adjust path as necessary

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
      <LoginCard onLoginClick={handleLogin} />
    </Paper>
  );
}

export default LoginPage;
