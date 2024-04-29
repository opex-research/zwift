package main

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/joho/godotenv"
	"github.com/opex-research/zwift/router"
)

var store *session.Store

func init() {
	// Load the .env file from the current directory
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize a session store with specific cookie settings
	store = session.New(session.Config{
		Expiration:     24 * time.Hour, // Set session expiration duration
		CookieHTTPOnly: true,           // JavaScript cannot access cookies
		CookieSecure:   true,           // Only transfer cookies over HTTPS
		CookieSameSite: "None",         // Necessary for cross-origin requests
	})
}

func main() {
	app := fiber.New(fiber.Config{
		ErrorHandler: customErrorHandler,
	})

	app.Use(logger.New())
	app.Use(recover.New())

	// Setup routes with the configured session store
	router.SetupRoutes(app, store)

	// Start the server
	log.Fatal(app.Listen(":3001"))
}

func customErrorHandler(ctx *fiber.Ctx, err error) error {
	// Custom error handling logic
	return ctx.Status(500).SendString("Internal Server Error")
}
