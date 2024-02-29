import React, { useState } from "react";
import {
  TextField,
  Stack,
  Card,
  Typography,
  Divider,
  useTheme,
  Button,
  Box,
} from "@mui/material";
import PayPalIntegration from "./PayPalIntegration";
import SettingsIcon from "@mui/icons-material/Settings"; // Import Settings icon

const OnRamp = () => {
  const [amount, setAmount] = useState(0);
  const [email, setEmail] = useState("sb-sdcta29428430@personal.example.com");
  const theme = useTheme();
  const [successfullResponse, setResponse] = useState(false);
  const [doReset, setDoReset] = useState(false); // State to control reset

  const handleAmountChange = (event) => {
    const value = event.target.value;
    const sanitizedValue = value.replace(",", ".").replace(/[^0-9.]/g, "");
    setAmount(sanitizedValue);
  };

  function handleResponseChange(newValue) {
    setResponse(newValue);
  }


  return (
    <div>
      {!successfullResponse && (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
          {/* Headline with icon */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              bgcolor: "blue",
              color: "white",
              p: 2,
              borderRadius: "4px 4px 0 0", // Optional: rounds the top corners
            }}
          >
            <SettingsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Set Details</Typography>
          </Box>

          <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
            <Card sx={{ padding: 4, mb: 2 }}>
              <Stack spacing={2} alignItems="flex-start">
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "light" }}
                >
                  Set the amount to onramp:
                </Typography>
                <TextField
                  variant="outlined"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  fullWidth
                />
                <Divider
                  sx={{ width: "100%", my: 2, borderColor: "primary.main" }}
                />{" "}
                {/* Spacing & Divider */}
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "light" }}
                >
                  Peer to exchange with:
                </Typography>
                <TextField
                  disabled
                  type="email"
                  variant="outlined"
                  value={email}
                  fullWidth
                />
              </Stack>
            </Card>
          </Box>
        </Box>
      )}

      <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
        <Stack direction="column">
          {successfullResponse && (
            <Button variant="outlined">
              Perform another OnRamp Transaction
            </Button>
          )}
          <PayPalIntegration
            amount={amount}
            email={email}
            onSuccessfullResponse={handleResponseChange}
          />
        </Stack>
      </Box>
    </div>
  );
};

export default OnRamp;
