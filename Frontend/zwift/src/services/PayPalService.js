import axios from "axios";
import { getPeerForOnRamp } from "./OrchestratorOnRampService";

const goBackendUrl = process.env.REACT_APP_GO_BACKEND_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
const API_BASE_URL = `${goBackendUrl}/api/paypal`;
const offRamperEmail = sessionStorage.getItem("offRamperEmail");
console.log("Peer Email paypal transaction will be paid to:", offRamperEmail);

const createOrderData = (value = "100", currency = "USD") => ({
  intent: "CAPTURE",
  purchase_units: [
    {
      amount: {
        currency_code: currency,
        value: value,
      },
      payee: { email_address: offRamperEmail },
    },
  ],
  application_context: {
    return_url: `${frontendUrl}/checkout-handler`,
    cancel_url: `${frontendUrl}/cancel`,
  },
});

const PayPalService = {
  initiateCheckout: async (loginToken, amount = "100", currency = "USD") => {
    try {
      const orderData = createOrderData(amount, currency);
      const response = await axios.post(
        `${API_BASE_URL}/checkout`,
        {
          loginToken,
          orderData,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Checkout response:", response);
      return response.data.checkoutUrl;
    } catch (error) {
      console.error("Error initiating checkout:", error.response || error);
      throw error; // Rethrow to let the caller handle it
    }
  },
  verifyPayment: async (token, PayerID) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/verify-payment`,
        {
          token,
          PayerID,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Verify payment response:", response);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error.response || error);
      throw error;
    }
  },
};

export default PayPalService;
