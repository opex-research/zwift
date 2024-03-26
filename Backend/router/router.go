package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	handlers "github.com/opex-research/zwift/handlers"
)

// SetupRoutes func
func SetupRoutes(app *fiber.App) {

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://127.0.0.1:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// Routes
	app.Post("/api/auth/paypal/", handlers.CreateAccessTokenAndGetEmail)
	app.Get("/test-error/", func(c *fiber.Ctx) error {
		// This should trigger the global error handler and log the error.
		return fiber.NewError(fiber.StatusInternalServerError, "Test error")
	})
}
