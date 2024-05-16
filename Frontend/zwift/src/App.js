import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PayPalAuthPage from "./pages/PayPalAuthPage";
import PayPalCheckoutPage from "./pages/PayPalCheckoutPage";
import { AccountProvider } from "./context/AccountContext"; // Ensure this is imported

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
            <Route path="/" element={<HomePage />} />
            <Route path="/auth-handler" element={<PayPalAuthPage />} />
            <Route path="/checkout-handler" element={<PayPalCheckoutPage />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
