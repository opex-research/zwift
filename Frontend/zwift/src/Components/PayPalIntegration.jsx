import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  Stack,
  Divider,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings"; // Import Settings icon

// PayPalIntegration Component: Handles PayPal payment integration.
// Props:
// - amount: The total payment amount.
// - email: The payee's email address.
const PayPalIntegration = ({ amount, email }) => {
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Configuration for PayPalScriptProvider.
  // Later use of environment variables for sensitive data like client-id.
  const paypalOptions = {
    "client-id":
      "ATWNj8MbBvdUupI3VbC-isIb-fxnQ7j8Op6ch7rds51niwt1xGU0yreyPaFweWF_PZE5Yi71EXILTY7-",
    components: "buttons",
    currency: "EUR",
    disableFunding:
      "card,credit,sepa,bancontact,sofort,giropay,eps,ideal,mybank,p24",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div>
        {!paymentDetails && ( // Conditionally render PayPalButtons
          <PayPalButtons
            style={{ layout: "vertical" }}
            forceReRender={[amount]} // Ensures PayPal button updates with amount changes.
            createOrder={(data, actions) => {
              const formattedAmount = parseFloat(amount).toFixed(2);
              return actions.order.create({
                purchase_units: [
                  {
                    amount: { value: formattedAmount },
                    payee: { email_address: email },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                console.log("Payment Successful:", details);
                setPaymentDetails(details); // Update state to hide PayPalButtons
              });
            }}
            onError={(err) => console.error("Payment Error:", err)}
            onCancel={(data) => console.log("Payment Cancelled:", data)}
          />
        )}
        {/* Displays payment details upon successful payment */}
        {paymentDetails && (
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
              <Typography variant="h6">Payment Response</Typography>
            </Box>
            <Box sx={{ maxWidth: 500, mx: "auto", mt: 2 }}>
              <Card sx={{ padding: 4, mb: 2 }}>
                <Stack alignItems="flex-start" spacing={2}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "light" }}
                  >
                    Successful
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Payee"
                        secondary={
                          paymentDetails?.purchase_units[0]?.payee
                            ?.email_address
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Amount"
                        secondary={`€${paymentDetails?.purchase_units[0]?.amount?.value}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Status"
                        secondary={paymentDetails?.status}
                      />
                    </ListItem>
                  </List>

                  <Divider
                    sx={{ width: "100%", my: 2, borderColor: "primary.main" }}
                  />

                  <Box>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: "light" }}
                    >
                      Processing ...
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Box>
          </Box>
        )}
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalIntegration;
