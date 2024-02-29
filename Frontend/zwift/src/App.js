import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage"; // Import the new page
import { AccountProvider } from "./context/AccountContext"; // Adjust the path as necessary

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
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </AccountProvider>
    </ThemeProvider>
  );
}

export default App;
