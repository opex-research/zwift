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
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "../components/ErrorBoundary"; // Import your fallback component
import UserAccount from "../components/UserAccount";
import { getOpenOffRampIntentsFromQueue } from "../services/OrchestratorOffRampService";
import { useAccount } from "../context/AccountContext";

const HomePage = () => {
  const [value, setValue] = React.useState("onramp");
  const theme = useTheme();
  const matchesMDUp = useMediaQuery(theme.breakpoints.up("md"));
  const { setOpenOffRampsInQueue } = useAccount();

  // Fetch the total amount of offramps
  const getOpenOffRampsInQueue = async () => {
    const openOffRampsInQueue = await getOpenOffRampIntentsFromQueue();
    if (openOffRampsInQueue) {
      setOpenOffRampsInQueue(openOffRampsInQueue);
    }
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === "onramp") {
      getOpenOffRampsInQueue();
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
        justifyContent="center"
        alignItems="center"
        style={{ maxWidth: "1200px" }}
      >
        {/* Account section */}
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
          <ErrorBoundary
            FallbackComponent={FallbackComponent}
            onError={(error, errorInfo) =>
              console.log("Logging error:", error, errorInfo)
            }
          >
            <UserAccount />
          </ErrorBoundary>
        </Grid>

        {/* Transfer section */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={1}
            sx={{
              width: "100%",
              maxWidth: "600px",
              p: theme.spacing(4),
              borderRadius: 4,
              flexDirection: "column",
              alignItems: "center",
              minHeight: "600px",
              m: 2,
            }}
          >
            <Box sx={{ alignSelf: "flex-start", mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
                TRANSFER
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Overview of transfer options
              </Typography>
            </Box>
            <ErrorBoundary
              FallbackComponent={FallbackComponent}
              onError={(error, errorInfo) =>
                console.log("Logging error:", error, errorInfo)
              }
            >
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
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default HomePage;
