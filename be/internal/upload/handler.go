package upload

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const uploadDir = "./uploads/general"

// Handler handles generic file uploads
type Handler struct{}

func Wire() *Handler {
	return &Handler{}
}

func (h *Handler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}

	ext := filepath.Ext(file.Filename)
	if !isAllowedExt(ext) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only jpg, jpeg, png, webp allowed"})
		return
	}

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload dir"})
		return
	}

	filename := uuid.New().String() + ext
	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	url := fmt.Sprintf("/uploads/general/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": url})
}

func isAllowedExt(ext string) bool {
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
		return true
	}
	return false
}
