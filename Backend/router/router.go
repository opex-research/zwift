package router

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/session"
	handlers "github.com/opex-research/zwift/handlers"
)

// SetupRoutes configures the application routes
func SetupRoutes(app *fiber.App, store *session.Store) {
	h := &handlers.Handler{Store: store}

	// Configuring CORS to be completely open for debugging
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept",
		AllowCredentials: true,
	}))

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
