package handlers

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/opex-research/zwift/paypal"
)

// Handler struct contains the session store.
type Handler struct {
	Store *session.Store
}

// InitiateCheckout handles creating a PayPal order.
// It retrieves an access token, creates an order, and returns the checkout URL.
func (h *Handler) InitiateCheckout(c *fiber.Ctx) error {
	// Struct to parse the incoming request.
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
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Get session and store the access token.
	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}
	sess.Set("accessToken", tokenResp.AccessToken)
	log.Printf("Access token set in session: %s", tokenResp.AccessToken)
	log.Printf("Session ID in InitiateCheckout: %s", sess.ID())

	// Save the session changes.
	if err := sess.Save(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error saving session")
	}

	// Call the CreateOrder function with the provided order data.
	orderResponse, err := paypal.CreateOrder(tokenResp.AccessToken, request.OrderData)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Find the approval link in the order response.
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

	// Return the checkout URL to the frontend.
	return c.JSON(fiber.Map{"checkoutUrl": checkoutUrl})
}

// VerifyPayment captures and checks the payment status for the given order ID.
// It also signs the payment details and returns the signature.
func (h *Handler) VerifyPayment(c *fiber.Ctx) error {
	type VerifyRequest struct {
		OrderID string `json:"token"`
		PayerID string `json:"PayerID"`
	}

	var request VerifyRequest
	if err := c.BodyParser(&request); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Failed to parse request body")
	}

	// Retrieve session and access token.
	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}
	log.Printf("Session ID in verify: %s", sess.ID())

	accessToken, ok := sess.Get("accessToken").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).SendString("Access token not found in session")
	}
	log.Printf("Access token retrieved from session: %s", accessToken)

	// Capture the order using PayPal's API.
	captureDetails, err := paypal.CaptureOrder(accessToken, request.OrderID)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Validate the capture details.
	if len(captureDetails.PurchaseUnits) == 0 || len(captureDetails.PurchaseUnits[0].Payments.Captures) == 0 {
		return fiber.NewError(fiber.StatusInternalServerError, "No captures found in the response")
	}

	captureStatus := captureDetails.PurchaseUnits[0].Payments.Captures[0].Status
	if captureStatus != "COMPLETED" {
		// The payment was not successful.
		return c.JSON(fiber.Map{"success": false, "message": "Payment was not successful, capture status: " + captureStatus})
	}

	// The payment was successful. Prepare to sign the message.
	timestamp := time.Now().Unix()
	message := fmt.Sprintf("%s:%s:%d", request.OrderID, captureStatus, timestamp)

	// Sign the message.
	signatureHex, err := signMessage(message)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Return the response including the signature.
	return c.JSON(fiber.Map{
		"success":   true,
		"orderID":   request.OrderID,
		"status":    captureStatus,
		"timestamp": timestamp,
		"signature": signatureHex,
	})
}

// Login handles user authentication via PayPal.
// It retrieves the user's email, signs it, and returns it along with the signature.
func (h *Handler) Login(c *fiber.Ctx) error {
	// Retrieve the authorization code from the form data.
	authorizationCode := c.FormValue("authorizationCode")
	if authorizationCode == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Authorization code is required")
	}

	// Request an access token from PayPal.
	tokenResp, err := paypal.RequestAccessToken(authorizationCode)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Use the access token to retrieve the user's email from PayPal.
	email, err := paypal.GetUserEmail(tokenResp.AccessToken)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Store the access token in the session.
	sess, err := h.Store.Get(c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Internal Server Error")
	}
	sess.Set("accessToken", tokenResp.AccessToken)

	// Save the session.
	if err := sess.Save(); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Error saving session")
	}

	// Prepare the message to sign.
	timestamp := time.Now().Unix()
	message := fmt.Sprintf("%s:%d", email, timestamp)

	// Sign the message.
	signatureHex, err := signMessage(message)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Successfully retrieved email, return it along with the signature.
	return c.JSON(fiber.Map{
		"email":     email,
		"timestamp": timestamp,
		"signature": signatureHex,
	})
}

// signMessage hashes and signs the message using the private key.
func signMessage(message string) (string, error) {
	// Get the private key from environment variable.
	privateKeyHex := os.Getenv("PRIVATE_KEY")
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", fmt.Errorf("invalid private key")
	}

	// Hash the message with Ethereum prefix.
	messageHash := prefixedHash([]byte(message))

	// Sign the hash.
	signature, err := crypto.Sign(messageHash, privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign message")
	}

	// Encode the signature to hex.
	signatureHex := hexutil.Encode(signature)
	return signatureHex, nil
}

// prefixedHash applies Ethereum message prefix and hashes the message.
func prefixedHash(message []byte) []byte {
	msg := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)
	return crypto.Keccak256([]byte(msg))
}
