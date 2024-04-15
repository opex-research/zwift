import React, { useEffect, useState } from "react";
import {
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
  Typography,
  useTheme,
  Paper,
  Box,
} from "@mui/material";
import OnRamp from "../components/OnRamp";
import OffRamp from "../components/OffRamp";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "../components/ErrorBoundary";
import UserAccount from "../components/UserAccount";
import { getOpenOffRampIntentsFromQueue } from "../services/AccountInfoService";
import { useAccount } from "../context/AccountContext";

/**
 * HomePage component serves as the landing page for the application.
 * It provides users with options to navigate between OnRamp and OffRamp functionalities,
 * and displays the user's account information.
 */
const HomePage = () => {
  const [value, setValue] = useState("onramp"); // State to manage tab selection
  const theme = useTheme(); // Access MUI theme for consistent styling
  const matchesMDUp = useMediaQuery(theme.breakpoints.up("md")); // Breakpoint check for responsive design
  const { setOpenOffRampsInQueue } = useAccount(); // Account context for managing state

  // Effect to fetch the total amount of open offramps when component mounts or value changes to 'onramp'
  useEffect(() => {
    if (value === "onramp") {
      fetchOpenOffRampsInQueue();
    }
  }, [value]);

  /**
   * Fetches the total amount of open offramps and updates context.
   */
  const fetchOpenOffRampsInQueue = async () => {
    const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
    if (openOffRampsInQueue) {
      setOpenOffRampsInQueue(openOffRampsInQueue);
    }
  };

  /**
   * Handles tab selection changes.
   * @param {Object} event - The triggering event.
   * @param {string} newValue - The new tab value.
   */
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(to right, #bbdefb, #e1f5fe)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        style={{ maxWidth: "1200px" }}
      >
        {/* Account Section */}
        <AccountSection theme={theme} />

        {/* Transfer Section */}
        <TransferSection
          theme={theme}
          value={value}
          handleChange={handleChange}
        />
      </Grid>
    </div>
  );
};

/**
 * AccountSection component to encapsulate the UserAccount related UI.
 * @param {Object} theme - The MUI theme object for styling.
 */
const AccountSection = ({ theme }) => (
  <Grid item xs={12} md={6}>
    <StyledPaper theme={theme}>
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <UserAccount />
      </ErrorBoundary>
    </StyledPaper>
  </Grid>
);

/**
 * TransferSection component to encapsulate the transfer (OnRamp/OffRamp) related UI.
 * @param {Object} theme - The MUI theme object for styling.
 * @param {string} value - Current tab value.
 * @param {Function} handleChange - Handler for tab change.
 */
const TransferSection = ({ theme, value, handleChange }) => (
  <Grid item xs={12} md={6}>
    <StyledPaper theme={theme}>
      <Box sx={{ alignSelf: "flex-start", mb: 8 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
          TRANSFER
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Overview of transfer options
        </Typography>
      </Box>
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          centered
        >
          <Tab value="onramp" label="OnRamp" />
          <Tab value="offramp" label="OffRamp" />
        </Tabs>
      </ErrorBoundary>
      <TransferContent value={value} />
    </StyledPaper>
  </Grid>
);

/**
 * StyledPaper component for consistent styling of Paper elements in the HomePage.
 * @param {Object} theme - The MUI theme object for consistent styling.
 * @param {React.ReactNode} children - The child components to be rendered inside the Paper.
 */
const StyledPaper = ({ theme, children }) => (
  <Paper
    elevation={1}
    sx={{
      width: "100%",
      maxWidth: "700px",
      minHeight: "700px",
      p: theme.spacing(4),
      borderRadius: 4,
      flexDirection: "column",
      alignItems: "center",
      m: 2,
    }}
  >
    {children}
  </Paper>
);

/**
 * TransferContent component to conditionally render OnRamp or OffRamp based on the selected tab.
 * @param {string} value - The current selected tab value.
 */
const TransferContent = ({ value }) => (
  <Box
    sx={{
      paddingTop: "20px",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
    }}
  >
    {value === "onramp" && <OnRamp />}
    {value === "offramp" && <OffRamp />}
  </Box>
);

export default HomePage;
