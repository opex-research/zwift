import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  useMediaQuery,
  Paper,
  useTheme,
  Stack,
} from "@mui/material";
import OnRamp from "../components/OnRamp";
import OffRamp from "../components/OffRamp";
import UserAccount from "../components/UserAccount";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "../components/ErrorBoundary";
import { getOpenOffRampIntentsFromQueue } from "../services/AccountInfoService";
import { AccountProvider, useAccount } from "../context/AccountContext";
import { simulateAllPendingTransactionsToSuccess } from "../services/DatabaseService";
import CustomLink from "../components/EssentialComponents/CustomLink";
import CustomTypographyLabel from "../components/EssentialComponents/CustomTypographyLabel";
import CustomTypographyValue from "../components/EssentialComponents/CustomTypographyValue";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("activeTab") || "onramp";
  });
  const theme = useTheme();
  const { openOffRampsInQueue, account } = useAccount();

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
    sessionStorage.setItem("activeTab", newValue);
  };

  useEffect(() => {
    console.log("in effect", sessionStorage.getItem("preAuthTab"));
    const preAuthTab = sessionStorage.getItem("preAuthTab");
    console.log("pre tab", preAuthTab);
    if (preAuthTab) {
      setActiveTab(preAuthTab); // Assuming `setActiveTab` is a function or context method to update the tab
      sessionStorage.removeItem("preAuthTab"); // Clean up after restoring
    }
  }, []);

  const handleSimulateTransactionClick = () => {
    simulateAllPendingTransactionsToSuccess(account);
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
          }}
        >
          <Tab value="onramp" label="OnRamp" />
          <Tab value="offramp" label="OffRamp" />
          <Tab value="account" label="Account" />
        </Tabs>

        <Stack direction={"row"}>
          <CustomLink
            displayText={"Docs"}
            urllink={
              "https://app.gitbook.com/o/ljcFhZQ6qR0JA67ctDqn/s/JJ61uAFlATq2ddoxNCfA/"
            }
          />
          <CustomLink
            displayText={"Github"}
            urllink={"https://github.com/opex-research/zwift"}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          flexDirection: "column",
          paddingTop: "30",
        }}
      >
        {activeTab === "onramp" && <OnRamp />}
        {activeTab === "offramp" && <OffRamp />}
        {activeTab === "account" && <UserAccount />}
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSimulateTransactionClick}
        sx={{ mx: theme.spacing(2), my: theme.spacing(2) }}
      >
        Simulate Transaction Success
      </Button>

      <Paper
        sx={{
          padding: 2,
          position: "fixed",
          bottom: 100,
          background: "linear-gradient(45deg, #424242 0%, #212121 100%)",
          color: "white",
          borderRadius: "12px",
          margin: "auto",
          minWidth: 280,
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.2), 0px 6px 20px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow:
              "0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.4)",
          },
        }}
        elevation={4}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <SwapHorizIcon sx={{ color: "white", fontSize: 36 }} />
            <CustomTypographyLabel
              value="available off-ramps"
              sx={{ fontSize: 24, fontWeight: "bold" }}
            />
          </Stack>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: "bold",
              background: "rgba(255, 255, 255, 0.15)", // lighter background
              borderRadius: "4px", // smaller border-radius
              padding: "2px 6px", // reduced padding
              textAlign: "center",
              display: "inline-block",
              minWidth: "auto",
            }}
          >
            {openOffRampsInQueue}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;
