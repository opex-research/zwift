import axios from "axios";
const goBackendUrl = process.env.REACT_APP_GO_BACKEND_URL;
const frontendUrl = process.env.REACT_APP_FRONTEND_URL;
const pythonBackendUrl = process.env.REACT_APP_PYTHON_BACKEND_URL;
const API_BASE_URL = `${goBackendUrl}/api/paypal`;

const createOrderData = (value = "100", currency = "USD") => ({
  intent: "CAPTURE",
  purchase_units: [
    {
      amount: {
        currency_code: currency,
        value: value,
      },
      payee: { email_address: "sb-sdcta29428430@personal.example.com" },
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
          withCredentials: true, // Add this option
        }
      );
      console.log(response);
      return response.data.checkoutUrl;
    } catch (error) {
      console.error("Error initiating checkout:", error);
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
          withCredentials: true, // Add this option
        }
      );
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  },
};

export default PayPalService;
