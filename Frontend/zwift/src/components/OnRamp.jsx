import React, { useState } from "react";
import {
  TextField,
  Typography,
  Divider,
  useTheme,
  Button,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Stack,
  Slider,
} from "@mui/material";
import PayPalIntegration from "./PayPalIntegration";
import CashIcon from "../icons/icons8-cashflow-48.png"; // Import the PNG file
import ExchangeIcon from "../icons/icons8-transfer-zwischen-benutzern-48.png"; // Import the PNG file
import { useAccount } from "../context/AccountContext";
import CancelIcon from "../icons/icons8-x-48.png"; // Import the PNG file
import CheckIcon from "../icons/icons8-häkchen-48.png"; // Import the PNG file
import { getPeerForOnRamp } from "../services/OrchestratorOnRampService";

const OnRamp = () => {
  const [email, setEmail] = useState("peer1paypal@test.comn");
  const [successfullResponse, setResponse] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { openOffRampsInQueue } = useAccount();
  const [searchForPeerState, setSearchForPeer] = useState("off"); //off; searching; found
  const isSearchDisabled = openOffRampsInQueue === 0;
  const [sliderValue, setSliderValue] = useState(100);

  // Utility function to simulate network delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleResponseChange = (newValue) => {
    setResponse(newValue);
  };

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleBackButton = () => {
    setPaymentDetails(null);
    setResponse(false);
    setResetCounter((prev) => prev + 1);
  };

  const handleSearchForPeer = async () => {
    setSearchForPeer("searching");
    try {
      // Await the async call to getPeerForOnRamp and then destructure the result
      const { peerAddress, peerEmail } = await getPeerForOnRamp();
      // Assuming you want to do something with peerAddress as well
      console.log("Peer Address:", peerAddress); // You can remove this line; it's just for demonstration
      setEmail(peerEmail);
      setSearchForPeer("found");
    } catch (error) {
      console.error("Error searching for Peer:", error);
      // Handle the error state appropriately
      setSearchForPeer("off");
      // Optionally, set some error message state here to display to the user
    }
  };

  const theme = useTheme();

  return (
    <div
      style={{
        paddingTop: "20px",
      }}
    >
      <Grid container spacing={2} direction="column">
        <Grid item container alignItems="center">
          <Grid item>
            <img
              src={openOffRampsInQueue > 0 ? CheckIcon : CancelIcon}
              alt={openOffRampsInQueue > 0 ? "Check Icon" : "Cancel Icon"}
              style={{ width: "50%", height: "50%", color: "red" }}
            />
          </Grid>

          <Grid item>
            <Typography variant="caption" display="block" color="textSecondary">
              OPEN OFFRAMP INTENTS BY PEERS:
            </Typography>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 50, // Adjust the width of the rectangle as needed
                height: 25, // Adjust the height of the rectangle as needed
                borderRadius: "10px", // This creates the rounded corners
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                marginLeft: 2,
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
              >
                {openOffRampsInQueue}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid item>
          <Divider sx={{ marginY: theme.spacing(2) }} />
        </Grid>

        <Grid item container alignItems="center">
          <Grid item>
            <img
              src={CashIcon}
              alt="Cash Icon"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption" display="block" color="textSecondary">
              SET AMOUNT TO ONRAMP:
            </Typography>
          </Grid>
          <Grid item xs>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: 50, // Adjust the width of the rectangle as needed
                height: 25, // Adjust the height of the rectangle as needed
                borderRadius: "10px", // This creates the rounded corners
                backgroundColor: "#F7FAFD",
                color: "#1B6AC8",
                marginLeft: 2,
              }}
            >
              <Typography
                variant="h7"
                component="span"
                sx={{ color: "inherit" }}
              >
                ${sliderValue}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Grid item>
          <Grid item xs>
            <Stack
              spacing={2}
              direction="row"
              sx={{ mb: 1, width: 300, pl: 1.7 }} // Adds padding to the left and sets a max width
              alignItems="center"
            >
              <Slider
                aria-label="Amount"
                value={sliderValue}
                onChange={null}
                step={null} // Null step disables the default stepping behavior
                marks={[
                  { value: 25, label: "$25" },
                  { value: 50, label: "$50" },
                  { value: 75, label: "$75" },
                  { value: 100, label: "$100" },
                ]}
                valueLabelDisplay="auto" // Automatically show the value label
                min={25} // Minimum value
                max={100} // Maximum value
              />
            </Stack>
          </Grid>
        </Grid>
        <Grid item>
          <Divider sx={{ marginY: theme.spacing(2) }} />
        </Grid>
        <Grid item container alignItems="center">
          <Grid item>
            <img
              src={ExchangeIcon}
              alt="Exchange Icon"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption" display="block" color="textSecondary">
              PEER TO EXCHANGE WITH:
            </Typography>
          </Grid>
          <Grid item xs>
            <Stack direction="row" sx={{ width: "100%", alignItems: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  height: 25,
                  borderRadius: "10px",
                  backgroundColor: isSearchDisabled
                    ? "#FFCDD2"
                    : searchForPeerState === "found"
                    ? "#C8E6C9"
                    : "#F7FAFD",
                  color: isSearchDisabled
                    ? "#ff8383"
                    : searchForPeerState === "off"
                    ? "#ff8383"
                    : searchForPeerState === "found"
                    ? "#7eb55c"
                    : "#f2f5f0",
                  padding: theme.spacing(0, 1),
                  marginLeft: "10px",
                }}
              >
                <Typography variant="body2" sx={{ color: "inherit" }}>
                  {isSearchDisabled
                    ? "Sorry, there are no offramp intents yet."
                    : searchForPeerState === "off"
                    ? "Please press 'Search for Peer'"
                    : email}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
          <Grid container direction="column">
            {!successfullResponse && searchForPeerState === "off" && (
              <Button
                variant="outlined"
                onClick={handleSearchForPeer}
                disabled={isSearchDisabled}
              >
                Search for Peer
              </Button>
            )}
            {searchForPeerState === "found" && (
              <PayPalIntegration
                amount="100"
                email={email}
                onSuccessfullResponse={handleResponseChange}
                paymentDetails={paymentDetails}
                key={resetCounter}
              />
            )}
            {searchForPeerState === "searching" && <CircularProgress />}
            {successfullResponse && (
              <Button variant="outlined" onClick={handleBackButton}>
                Perform another OnRamp Transaction
              </Button>
            )}
          </Grid>
        </Box>
      </Grid>
    </div>
  );
};

export default OnRamp;
