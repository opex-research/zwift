import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PayPalAuthPage from "./pages/PayPalAuthPage";
import { AccountProvider } from "./context/AccountContext";
import ProtectedRoute from "./components/ProtectedRoute"; // Adjust the path as necessary
import { AlertProvider } from "./context/AlertContext";

const theme = createTheme({
  // Theme customization goes here
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccountProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth-handler" element={<PayPalAuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
