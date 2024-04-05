import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:3001/api/paypal";

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
    return_url: "http://127.0.0.1:3000/checkout-handler",
    cancel_url: "http://localhost/cancel",
  },
});

const PayPalService = {
  initiateCheckout: async (loginToken, amount = "100", currency = "USD") => {
    try {
      const orderData = createOrderData(amount, currency);
      const response = await axios.post(`${API_BASE_URL}/checkout`, {
        loginToken,
        orderData,
      });
      console.log(response);
      return response.data.checkoutUrl;
    } catch (error) {
      console.error("Error initiating checkout:", error);
      throw error; // Rethrow to let the caller handle it
    }
  },
  verifyPayment: async (orderId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-payment`, {
        orderId,
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error; // Rethrow to let the caller handle it
    }
  },
};

export default PayPalService;
