package handlers

import (
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/opex-research/zwift/paypal"
)

var accessTokenStore struct {
	sync.RWMutex
	token string
}

// CreateAccessTokenAndGetEmail creates an access token and retrieves user email from PayPal.
func CreateAccessTokenAndGetEmail(c *fiber.Ctx) error {
	// Extract the authorization code from the request query parameters.
	authorizationCode := c.Query("code")
	if authorizationCode == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Authorization code is missing")
	}

	// Request an access token from PayPal.
	tokenResp, err := paypal.RequestAccessToken(authorizationCode)
	if err != nil {
		// Assuming err already contains sufficient context for logging and response.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Use the access token to retrieve the user's email from PayPal.
	email, err := paypal.GetUserEmail(tokenResp.AccessToken)
	if err != nil {
		// Assuming err already contains sufficient context for logging and response.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Successfully retrieved email, return it to the frontend.
	return c.JSON(fiber.Map{"email": email})
}

// InitiateCheckout handles creating a PayPal order.
func InitiateCheckout(c *fiber.Ctx) error {
	// Struct to parse the incoming request
	type CheckoutRequest struct {
		LoginToken string                 `json:"loginToken"`
		OrderData  map[string]interface{} `json:"orderData"`
	}

	var request CheckoutRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Failed to parse request body")
	}

	// Request an access token from PayPal.
	tokenResp, err := paypal.RequestAccessToken(request.LoginToken)
	if err != nil {
		// Assuming err already contains sufficient context for logging and response.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	accessTokenStore.Lock()
	accessTokenStore.token = tokenResp.AccessToken
	accessTokenStore.Unlock()

	// Call the CreateOrder function with the provided order data
	orderResponse, err := paypal.CreateOrder(tokenResp.AccessToken, request.OrderData)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Find the approval link in the order response
	var checkoutUrl string
	for _, link := range orderResponse.Links {
		if link.Rel == "approve" {
			checkoutUrl = link.Href
			break
		}
	}

	if checkoutUrl == "" {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to retrieve checkout URL")
	}

	// Return the checkout URL to the frontend
	return c.JSON(fiber.Map{"checkoutUrl": checkoutUrl})
}

// VerifyPayment captures and checks the payment status for the given order ID.
func VerifyPayment(c *fiber.Ctx) error {
	type VerifyRequest struct {
		OrderID string `json:"orderId"`
	}

	var request VerifyRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Failed to parse request body")
	}

	accessTokenStore.RLock()
	accessToken := accessTokenStore.token
	accessTokenStore.RUnlock()

	// Call the CaptureOrder function from your paypal package
	captureDetails, err := paypal.CaptureOrder(accessToken, request.OrderID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Assume that we are interested in the first purchase unit and its first capture for simplicity
	if len(captureDetails.PurchaseUnits) == 0 || len(captureDetails.PurchaseUnits[0].Payments.Captures) == 0 {
		return fiber.NewError(fiber.StatusInternalServerError, "No captures found in the response")
	}

	captureStatus := captureDetails.PurchaseUnits[0].Payments.Captures[0].Status
	if captureStatus != "COMPLETED" {
		// The payment was not successful, handle accordingly
		return c.JSON(fiber.Map{"success": false, "message": "Payment was not successful, capture status: " + captureStatus})
	}

	// The payment was successful
	return c.JSON(fiber.Map{"success": true, "message": "Payment verified successfully"})
}
