import React from "react";
import {
  useMediaQuery,
  Tabs,
  Tab,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import OnRamp from "../components/OnRamp";
import OffRamp from "../components/OffRamp";
import UserAccount from "../components/UserAccount";

const HomePage = () => {
  const [value, setValue] = React.useState("onramp");
  const theme = useTheme();
  const matchesMDUp = useMediaQuery(theme.breakpoints.up("md"));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{ height: matchesMDUp ? "100vh" : "auto", width: "100%", padding: 2 }}
    >
      {/* UserAccount section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <UserAccount />
      </Grid>

      {/* Wallet Interaction section */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ textAlign: "center", marginBottom: 2 }}>
          Interact with your wallet
        </Typography>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth" // Ensures tabs take up the full available width
          centered
        >
          <Tab value="onramp" label="OnRamp" />
          <Tab value="offramp" label="OffRamp" />
        </Tabs>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
            width: "100%",
          }}
        >
          <div style={{ maxWidth: "600px" }}>
            {value === "onramp" && <OnRamp />}
            {value === "offramp" && <OffRamp />}
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default HomePage;
