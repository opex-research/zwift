import React, { useState } from "react";
import {
  Button,
  Box,
  Typography,
  Tab,
  Tabs,
  useMediaQuery,
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

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("onramp");
  const theme = useTheme();

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
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
        onClick={simulateAllPendingTransactionsToSuccess}
        sx={{ mx: theme.spacing(2), my: theme.spacing(2) }}
      >
        Simulate Transaction Success
      </Button>
      <Box
        sx={{
          position: "fixed", // Fixes position relative to the viewport
          bottom: 40, // Anchors the box to the bottom of the viewport
          left: 0,
          width: "100%", // Ensures the box stretches across the width of the viewport
          bgcolor: "background.paper", // Uses theme color for background
          color: "text.primary", // Uses theme color for text
          p: 2, // Padding for some inner space
          textAlign: "center", // Centers the text inside the box
        }}
      >
        <Typography variant="body1">Fixed Position Footer Text</Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
