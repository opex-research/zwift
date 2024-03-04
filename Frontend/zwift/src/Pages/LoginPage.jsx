import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import {
  loginUserAccount,
  registerUserAccount,
  getAccountBalance,
  getUserEmail,
} from "../services/OrchestratorLoginService";
import { Paper } from "@mui/material";
import LoginCard from "../components/LoginCard"; // Adjust path as necessary

function LoginPage() {
  const navigate = useNavigate();
  const { setAccount, setBalance, setLogged, setRegisteredEmail } = useAccount();
  const [email, setEmail] = useState("");

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

  const handleEmailChange = (newEmail) => {
    setEmail(newEmail);
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
      <LoginCard
        onLoginClick={handleLogin}
        onSignUpClick={handleSignUp}
        onEmailChange={handleEmailChange}
        email={email}
      />
    </Paper>
  );
}

export default LoginPage;
