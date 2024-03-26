package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/opex-research/zwift/paypal"
)

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
