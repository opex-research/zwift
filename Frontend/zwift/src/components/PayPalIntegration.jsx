import React, { useEffect, useState } from "react";
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
import SettingsIcon from "@mui/icons-material/Settings";

/**
 * PayPalIntegration Component
 *
 * This component handles PayPal integration for payment processing.
 * It displays PayPal buttons for payment and shows payment details after a successful transaction.
 *
 * @param {Object} props
 * @param {string} props.amount - The payment amount
 * @param {string} props.email - The payee's email address
 * @param {Function} props.onSuccessfullResponse - Callback function for successful payment
 * @param {Object} props.paymentDetails - Details of the payment (if already processed)
 */
const PayPalIntegration = ({
  amount,
  email,
  onSuccessfullResponse,
  paymentDetails,
}) => {
  const [internalPaymentDetails, setPaymentDetails] = useState(paymentDetails);

  // PayPal configuration options
  const paypalOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID, // Use environment variable for client ID
    components: "buttons",
    currency: "EUR",
    disableFunding:
      "card,credit,sepa,bancontact,sofort,giropay,eps,ideal,mybank,p24",
  };

  useEffect(() => {
    setPaymentDetails(paymentDetails);
  }, [paymentDetails]);

  /**
   * Renders the payment details card after a successful payment
   */
  const renderPaymentDetails = () => (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "left",
          bgcolor: "primary.main",
          color: "white",
          p: 2,
          borderRadius: "4px 4px 0 0",
        }}
      >
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Payment Response</Typography>
      </Box>
      <Card sx={{ padding: 4, mb: 2 }}>
        <Stack alignItems="flex-start" spacing={2}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "light" }}>
            Successful
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Payee"
                secondary={
                  internalPaymentDetails?.purchase_units[0]?.payee
                    ?.email_address
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Amount"
                secondary={`€${internalPaymentDetails?.purchase_units[0]?.amount?.value}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Status"
                secondary={internalPaymentDetails?.status}
              />
            </ListItem>
          </List>
          <Divider sx={{ width: "100%", my: 2, borderColor: "primary.main" }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "light" }}>
            Processing ...
          </Typography>
        </Stack>
      </Card>
    </Box>
  );

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <div>
        {!internalPaymentDetails && (
          <PayPalButtons
            style={{ layout: "vertical" }}
            forceReRender={[amount]}
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
                setPaymentDetails(details);
                onSuccessfullResponse(true);
              });
            }}
            onError={(err) => console.error("Payment Error:", err)}
            onCancel={(data) => console.log("Payment Cancelled:", data)}
          />
        )}
        {internalPaymentDetails && renderPaymentDetails()}
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalIntegration;
