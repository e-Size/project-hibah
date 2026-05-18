package productimage

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const uploadDir = "./uploads/products"

type Handler struct {
	service *Service
}

func (h *Handler) GetByProduct(c *gin.Context) {
	list, err := h.service.FindByProduct(c.Param("product_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

func (h *Handler) Create(c *gin.Context) {
	productID, err := uuid.Parse(c.PostForm("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product_id"})
		return
	}
	order, _ := strconv.Atoi(c.PostForm("order"))

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file required"})
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

	img, err := h.service.Create(CreateRequest{
		ProductID: productID,
		FilePath:  fmt.Sprintf("/uploads/products/%s", filename),
		Order:     order,
	})
	if err != nil {
		os.Remove(savePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": img})
}

func (h *Handler) Update(c *gin.Context) {
	req := UpdateRequest{}

	if orderStr := c.PostForm("order"); orderStr != "" {
		order, err := strconv.Atoi(orderStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order"})
			return
		}
		req.Order = &order
	}

	var newSavePath string
	if file, err := c.FormFile("image"); err == nil {
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
		newSavePath = filepath.Join(uploadDir, filename)
		if err := c.SaveUploadedFile(file, newSavePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}
		req.FilePath = fmt.Sprintf("/uploads/products/%s", filename)
	}

	img, oldPath, err := h.service.Update(c.Param("id"), req)
	if err != nil {
		if newSavePath != "" {
			os.Remove(newSavePath)
		}
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if oldPath != "" && req.FilePath != "" {
		os.Remove("." + oldPath)
	}
	c.JSON(http.StatusOK, gin.H{"data": img})
}

func (h *Handler) Delete(c *gin.Context) {
	filePath, err := h.service.Delete(c.Param("id"))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Image not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if filePath != "" {
		os.Remove("." + filePath)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Image deleted"})
}

func isAllowedExt(ext string) bool {
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
		return true
	}
	return false
}
