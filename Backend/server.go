package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/joho/godotenv"
	"github.com/opex-research/zwift/router"
)

var store = session.New() // Initialize a session store

func init() {
	// Load the .env file from the current directory
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(ctx *fiber.Ctx, err error) error {
			// Log the detailed error for internal diagnostics.
			// This is logged first to ensure it appears right after Fiber's own log line for the request.
			log.Printf("An error occurred: %v", err)

			// Determine if it's a Fiber error with a custom status code and message.
			e, ok := err.(*fiber.Error)
			if !ok {
				// For non-Fiber errors, assume it's an internal server error.
				e = fiber.NewError(fiber.StatusInternalServerError, "Internal Server Error")
			}

			// Here, we log the error again only if you need to ensure the error specifics appear in the log,
			// but typically, the first log statement is sufficient for internal diagnostics.

			// Use a generic error message for the frontend, while preserving the original status code.
			genericMessage := "An unexpected error occurred, please try again later."
			if e.Code == fiber.StatusBadRequest {
				// Assume BadRequest errors are safe and informative enough to send back as is.
				genericMessage = e.Message
			}

			// Respond to the client with a generic message.
			// This response is crafted to ensure that detailed error information is not exposed to the client.
			return ctx.Status(e.Code).SendString(genericMessage)
		},
	})

	app.Use(logger.New(logger.Config{
		// Configure logger if needed, the default configuration should automatically log before error handling.
	}))
	app.Use(recover.New())

	// Setup routes
	router.SetupRoutes(app, store)

	// Start the server
	log.Fatal(app.Listen(":3001"))
}
