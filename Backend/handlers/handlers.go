package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/opex-research/zwift/paypal"
)

type Handler struct {
	Store *session.Store
}

// InitiateCheckout handles creating a PayPal order.
func (h *Handler) InitiateCheckout(c *fiber.Ctx) error {
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

	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}

	// Set the access token in the session
	sess.Set("accessToken", tokenResp.AccessToken)
	log.Printf("Access token set in session: %s", tokenResp.AccessToken)
	log.Printf("Session ID in InitiateCheckout: %s", sess.ID())

	// Save the session changes
	if err := sess.Save(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error saving session")
	}

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
func (h *Handler) VerifyPayment(c *fiber.Ctx) error {
	type VerifyRequest struct {
		OrderID string `json:"orderId"`
	}

	var request VerifyRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Failed to parse request body")
	}

	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}

	// Get the access token from the session
	accessToken, ok := sess.Get("accessToken").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).SendString("Access token not found in session")
	}
	log.Printf("Access token retrieved from session: %s", accessToken)
	log.Printf("Session ID in verify: %s", sess.ID())

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

func (h *Handler) Login(c *fiber.Ctx) error {
	authorizationCode := c.FormValue("authorizationCode")

	if authorizationCode == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Access token is required")
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

	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}
	sess.Set("accessToken", tokenResp.AccessToken)

	// Set a reasonable expiry for the session
	sess.SetExpiry(24 * time.Hour)

	// Save the session
	if err := sess.Save(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error saving session")
	}

	// Successfully retrieved email, return it to the frontend.
	return c.JSON(fiber.Map{"email": email})
}

func (h *Handler) CheckSession(c *fiber.Ctx) error {
	sess, err := h.Store.Get(c)
	if err != nil {
		// If there's an error retrieving the session, handle it appropriately
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}

	// Check if session has an access token set
	accessToken := sess.Get("accessToken")
	if accessToken != nil {
		// You could also validate the accessToken here if needed

		// Optionally, you could regenerate the session ID here to prevent session fixation
		// if err := sess.Regenerate(); err != nil {
		//     return c.Status(fiber.StatusInternalServerError).SendString("Error regenerating session")
		// }

		// If the access token is present, the session is alive
		return c.SendString("Session alive")
	}

	// If no access token, the session is considered expired or invalid
	return c.SendString("Session expired or invalid")
}
