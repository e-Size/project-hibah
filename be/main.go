package main

import (
	"be/config"
	"be/models"
	"be/routes"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config.ConnectDB()
	config.DB.AutoMigrate(
		&models.Product{},
		&models.MaterialGroup{},
		&models.Material{},
		&models.SizeVariant{},
		&models.QuantityTier{},
		&models.ProductMaterial{},
		&models.PriceMatrix{},
		&models.ProductAddon{},
	)

	r := gin.Default()
	routes.SetupRoutes(r, config.DB)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
