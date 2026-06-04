package auth

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

// Simple in-memory token store
var (
	validTokens = make(map[string]bool)
	mu          sync.RWMutex
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func generateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// Login handler — validates against DB_NAME (username) and DB_PASSWORD (password)
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	dbName := os.Getenv("DB_NAME")
	dbPass := os.Getenv("DB_PASSWORD")

	if req.Username == dbName && req.Password == dbPass {
		token := generateToken()
		mu.Lock()
		validTokens[token] = true
		mu.Unlock()

		c.JSON(http.StatusOK, gin.H{"token": token})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Username atau password salah"})
}

// Logout handler
func Logout(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if token != "" {
		mu.Lock()
		delete(validTokens, token)
		mu.Unlock()
	}
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

// Verify handler — check if token is valid
func Verify(c *gin.Context) {
	token := c.GetHeader("Authorization")
	mu.RLock()
	ok := validTokens[token]
	mu.RUnlock()

	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"valid": true})
}

// AuthMiddleware protects routes behind token auth
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		mu.RLock()
		ok := validTokens[token]
		mu.RUnlock()

		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		c.Next()
	}
}
