package router

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	handlers "github.com/opex-research/zwift/handlers"
)

// CustomCORS middleware to allow all origins while allowing credentials
func CustomCORS() fiber.Handler {
	return func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		c.Set("Access-Control-Allow-Origin", origin)
		c.Set("Access-Control-Allow-Methods", "GET,POST,HEAD,PUT,DELETE,PATCH")
		c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept")
		c.Set("Access-Control-Allow-Credentials", "true")
		if c.Method() == "OPTIONS" {
			return c.SendStatus(fiber.StatusNoContent)
		}
		return c.Next()
	}
}

// SetupRoutes configures the application routes
func SetupRoutes(app *fiber.App, store *session.Store) {
	h := &handlers.Handler{Store: store}

	// Use the custom CORS middleware
	app.Use(CustomCORS())

	// Middleware to log requests
	app.Use(func(c *fiber.Ctx) error {
		log.Printf("Request: %s %s", c.Method(), c.OriginalURL())
		return c.Next()
	})

	// Public routes
	app.Post("/api/auth/login", h.Login)
	app.Get("/api/auth/checksession", h.CheckSession)
	app.Post("/api/paypal/checkout", h.InitiateCheckout)
	app.Post("/api/paypal/verify-payment", h.VerifyPayment)
}
