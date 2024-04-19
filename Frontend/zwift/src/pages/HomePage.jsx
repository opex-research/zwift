import React, { useState } from "react";
import { Button, Box, Typography, Tab, Tabs } from "@mui/material";
import OnRamp from "../components/OnRamp";
import OffRamp from "../components/OffRamp";
import UserAccount from "../components/UserAccount";

const HomePage = () => {
  const [showAccountInfo, setShowAccountInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("onramp");

  const toggleAccountInfo = () => {
    setShowAccountInfo(!showAccountInfo);
  };

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
