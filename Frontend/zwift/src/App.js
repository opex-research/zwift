import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PayPalAuthPage from "./pages/PayPalAuthPage";
import PayPalCheckoutPage from "./pages/PayPalCheckoutPage";
import { AccountProvider, useAccount } from "./context/AccountContext"; // Adjusted import

const theme = createTheme({
  // Theme customization goes here
});

function App() {
  // Move ProtectedRoute inside App to ensure it has access to AccountContext
  const ProtectedRoute = ({ children }) => {
    const { logged, loading } = useAccount();

    if (loading) {
      return <div>Loading...</div>; // Or any other loading indicator
    }

    if (!logged) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AccountProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/auth-handler" element={<PayPalAuthPage />} />
            <Route path="/checkout-handler" element={<PayPalCheckoutPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
