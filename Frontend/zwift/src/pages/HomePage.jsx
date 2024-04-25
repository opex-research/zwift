import React, { useState } from "react";
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

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("onramp");
  const theme = useTheme();
  const { openOffRampsInQueue } = useAccount();

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
      <Paper
        sx={{
          padding: 4,
          position: "fixed",
          bottom: 100,
          background: "gray",
          color: "white",
          borderRadius: "12px",
          margin: "auto",
          minWidth: 550,
          boxShadow:
            "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.19)",
        }}
        elevation={4}
      >
        <Stack direction={"row"}>
          <CustomTypographyLabel
            value={"Total availble OffRamps"}
          ></CustomTypographyLabel>
          <CustomTypographyValue
            value={openOffRampsInQueue}
          ></CustomTypographyValue>
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;
