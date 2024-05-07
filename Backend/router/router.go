package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/session"
	handlers "github.com/opex-research/zwift/handlers"
)

// SetupRoutes func
func SetupRoutes(app *fiber.App, store *session.Store) {
	h := &handlers.Handler{Store: store}

	// Configuring CORS for both development and production environments
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://127.0.0.1:3000,http://34.32.62.23,http://34.32.62.23:80",
		AllowMethods:     "GET, POST, HEAD, PUT, DELETE, PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	// Public routes
	app.Post("/api/auth/login", h.Login)
	app.Get("/api/auth/checksession", h.CheckSession)
	app.Post("/api/paypal/checkout/", h.InitiateCheckout)
	app.Post("/api/paypal/verify-payment/", h.VerifyPayment)
}
