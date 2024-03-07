import React from "react";
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
import UserAccount from "../components/UserAccount";
import { getOpenOffRampIntentsFromQueue } from "../services/OrchestratorOffRampService";
import { useAccount } from "../context/AccountContext";
const HomePage = () => {
  const [value, setValue] = React.useState("onramp");
  const theme = useTheme();
  const matchesMDUp = useMediaQuery(theme.breakpoints.up("md"));
  const { setOpenOffRampsInQueue } = useAccount();

  // Here we fetch the total amount of onramps
  const getOpenOffRampsInQueue = async () => {
    const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
    if (openOffRampsInQueue) {
      setOpenOffRampsInQueue(openOffRampsInQueue);
    }
  };

  // The handleChange function is not async, and it calls the async function above
  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === "onramp") {
      // Only fetch when the 'onramp' tab is selected
      getOpenOffRampsInQueue(); // Call the async function
    }
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
        justifyContent="center" // Center the items horizontally
        alignItems="center" // Center the items vertically
        style={{
          maxWidth: "1200px", // Maximum width of the grid container
        }}
      >
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
        {/* Wallet Interaction section within a Paper */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              width: "100%",
              maxWidth: "600px",
              height: "600px", // Fixed height

              p: theme.spacing(4),
              borderRadius: 4,
              flexDirection: "column",
              alignItems: "center",
              m: 2, // Adjust margin to ensure consistency
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "medium",
                marginBottom: 4, // Adjust according to your layout needs
              }}
            >
              TRANSFER
            </Typography>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="fullWidth"
              centered
            >
              <Tab value="onramp" label="OnRamp" />
              <Tab value="offramp" label="OffRamp" />
            </Tabs>
            <Box sx={{ paddingTop: "20px" }}>
              {value === "onramp" && <OnRamp />}
              {value === "offramp" && <OffRamp />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;
