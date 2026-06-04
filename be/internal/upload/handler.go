package upload

import (
	"be/internal/imgutil"
	"fmt"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
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

	// Compress and save as JPEG
	filename, err := imgutil.CompressAndSave(file, uploadDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to compress and save file"})
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
