package main

import (
	"be/config"
	"be/models"
	"be/routes"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

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
		&models.ProductImage{},
	)

	r := gin.Default()
	r.Use(corsMiddleware())
	routes.SetupRoutes(r, config.DB)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
