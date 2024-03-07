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
} from "@mui/material";
import PayPalIntegration from "./PayPalIntegration";
import CashIcon from "../icons/icons8-cashflow-48.png"; // Import the PNG file
import ExchangeIcon from "../icons/icons8-transfer-zwischen-benutzern-48.png"; // Import the PNG file
import { useAccount } from "../context/AccountContext";

const OnRamp = () => {
  const [email, setEmail] = useState("sb-sdcta29428430@personal.example.com");
  const [successfullResponse, setResponse] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { openOffRampsInQueue } = useAccount();

  const handleResponseChange = (newValue) => {
    setResponse(newValue);
  };

  const handleBackButton = () => {
    setPaymentDetails(null);
    setResponse(false);
    setResetCounter((prev) => prev + 1);
  };

  const theme = useTheme();

  return (
    <div
      style={{
        paddingTop: "20px",
      }}
    >
      <Grid container spacing={2} direction="column">
        <Grid item container alignItems="flex-start">
          <Grid item>
            <img
              src={CashIcon}
              alt="Cash Icon"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="caption" display="block" color="textSecondary">
              OPEN ONRAMP INTENTS BY PEERS
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Typography variant="h5" display="block">
            {openOffRampsInQueue}
          </Typography>
        </Grid>
        <Grid item>
          <Divider sx={{ marginY: theme.spacing(2) }} />
        </Grid>

        <Grid item container alignItems="flex-start">
          <Grid item>
            <img
              src={CashIcon}
              alt="Cash Icon"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="caption" display="block" color="textSecondary">
              SET AMOUNT TO ONRAMP
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            disabled
            variant="outlined"
            type="text"
            value="100"
            fullWidth
          />
        </Grid>
        <Grid item>
          <Divider sx={{ marginY: theme.spacing(2) }} />
        </Grid>

        <Grid item container alignItems="flex-start">
          <Grid item>
            <img
              src={ExchangeIcon}
              alt="Exchange Icon"
              style={{ width: "50%", height: "50%" }}
            />
          </Grid>
          <Grid item xs>
            <Typography variant="caption" display="block" color="textSecondary">
              PEER TO EXCHANGE WITH
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            disabled
            type="email"
            variant="outlined"
            value={email}
            fullWidth
          />
        </Grid>

        <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
          <Grid container direction="column">
            {successfullResponse && (
              <Button variant="outlined" onClick={handleBackButton}>
                Perform another OnRamp Transaction
              </Button>
            )}
            <PayPalIntegration
              amount="100"
              email={email}
              onSuccessfullResponse={handleResponseChange}
              paymentDetails={paymentDetails}
              key={resetCounter}
            />
          </Grid>
        </Box>
      </Grid>
    </div>
  );
};

export default OnRamp;
