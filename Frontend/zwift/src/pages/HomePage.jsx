import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import OnRamp from "../components/OnRamp";
import OffRamp from "../components/OffRamp";
import UserAccount from "../components/UserAccount";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "../components/ErrorBoundary";
import { getOpenOffRampIntentsFromQueue } from "../services/AccountInfoService";
import { AccountProvider, useAccount } from "../context/AccountContext";
import { simulateAllPendingTransactionsToSuccess } from "../services/DatabaseService";

const HomePage = () => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("onramp");
  const theme = useTheme(); // Access MUI theme for consistent styling
  const matchesMDUp = useMediaQuery(theme.breakpoints.up("md")); // Breakpoint check for responsive design
  const { setOpenOffRampsInQueue, account } = useAccount(); // Account context for managing state

  const toggleAccountInfo = () => {
    setShowAccountInfo(!showAccountInfo);
  };

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const fetchOpenOffRampsInQueue = async () => {
    const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
    if (openOffRampsInQueue) {
      setOpenOffRampsInQueue(openOffRampsInQueue);
    }
  };
  // Simulate transaction success function
  const simulateTransactionSuccess = async () => {
    try {
      await simulateAllPendingTransactionsToSuccess(account);
    } catch (error) {
      console.log("Error updating transactions to success", error);
    }
    // Implement any further logic needed for simulation
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#212121",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={simulateTransactionSuccess}
        sx={{ mx: theme.spacing(50), my: theme.spacing(2) }}
      >
        Simulate Transaction Success
      </Button>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          color="white"
          sx={{
            ml: 3,
            fontWeight: "bold",
            fontFamily: "Monospace",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          ZWIFT
        </Typography>
        <Button
          variant="contained"
          onClick={toggleAccountInfo}
          sx={{
            bgcolor: "#424242",
            "&:hover": {
              bgcolor: "#616161",
            },
            color: "white",
          }}
        >
          ACCOUNT
        </Button>
      </Box>

      {showAccountInfo && (
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "5%",
            p: 2,
            width: 300,
            bgcolor: "black",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <UserAccount />
        </Box>
      )}

      <Box
        sx={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            ".MuiTabs-indicator": {
              backgroundColor: "darkred",
            },
            ".MuiTab-textColorInherit": {
              color: "white",
            },
            marginBottom: 2,
          }}
        >
          <Tab value="onramp" label="OnRamp" />
          <Tab value="offramp" label="OffRamp" />
        </Tabs>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Apply minWidth directly to the components for consistency */}
          {activeTab === "onramp" ? <OnRamp /> : <OffRamp />}
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
