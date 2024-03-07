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

const OnRamp = () => {
  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState("sb-sdcta29428430@personal.example.com");
  const [successfullResponse, setResponse] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const handleAmountChange = (event) => {
    const value = event.target.value;
    const sanitizedValue = value.replace(",", ".").replace(/[^0-9.]/g, "");
    setAmount(sanitizedValue);
  };

  const handleResponseChange = (newValue) => {
    setResponse(newValue);
  };

  const handleBackButton = () => {
    setAmount(0);
    setPaymentDetails(null);
    setResponse(false);
    setResetCounter((prev) => prev + 1);
  };

  const theme = useTheme();

  return (
    <Paper
      elevation={1}
      sx={{
        p: theme.spacing(4),
        maxWidth: 500,
        mx: "auto",
        my: theme.spacing(3),
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: "medium", marginBottom: 8 }}
      >
        On Ramp
      </Typography>
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
              SET AMOUNT TO ONRAMP
            </Typography>
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            variant="outlined"
            type="text"
            value={amount}
            onChange={handleAmountChange}
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
              amount={amount}
              email={email}
              onSuccessfullResponse={handleResponseChange}
              paymentDetails={paymentDetails}
              key={resetCounter}
            />
          </Grid>
        </Box>
      </Grid>
    </Paper>
  );
};

export default OnRamp;
