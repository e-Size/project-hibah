package sizeguide

import (
	"be/internal/imgutil"
	"be/internal/pagination"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

const uploadDir = "./uploads/size-guides"

type Handler struct {
	service *Service
}

func (h *Handler) GetAll(c *gin.Context) {
	p := pagination.ParseParams(c)
	list, total, err := h.service.GetAll(p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": list, "meta": pagination.CalcMeta(total, p)})
}

func (h *Handler) GetByProduct(c *gin.Context) {
	guide, err := h.service.FindByProduct(c.Param("product_id"))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Size guide not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": guide})
}

func (h *Handler) Create(c *gin.Context) {
	productID, err := uuid.Parse(c.PostForm("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product_id"})
		return
	}

	imageURL, savePath, err := saveImage(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	guide, err := h.service.Create(CreateRequest{ProductID: productID, ImageURL: imageURL})
	if err != nil {
		os.Remove(savePath)
		if errors.Is(err, ErrProductAlreadyHasSizeGuide) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": guide})
}

func (h *Handler) Update(c *gin.Context) {
	imageURL, savePath, err := saveImage(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	guide, oldPath, err := h.service.Update(c.Param("id"), UpdateRequest{ImageURL: imageURL})
	if err != nil {
		os.Remove(savePath)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Size guide not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if oldPath != "" {
		os.Remove("." + oldPath)
	}
	c.JSON(http.StatusOK, gin.H{"data": guide})
}

func (h *Handler) Delete(c *gin.Context) {
	filePath, err := h.service.Delete(c.Param("id"))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Size guide not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if filePath != "" {
		os.Remove("." + filePath)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Size guide deleted"})
}

func saveImage(c *gin.Context) (string, string, error) {
	file, err := c.FormFile("image")
	if err != nil {
		return "", "", errors.New("image file required")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return "", "", errors.New("only jpg, jpeg, png, webp allowed")
	}

	filename, err := imgutil.CompressAndSave(file, uploadDir)
	if err != nil {
		return "", "", errors.New("failed to compress and save file")
	}
	savePath := filepath.Join(uploadDir, filename)
	return fmt.Sprintf("/uploads/size-guides/%s", filename), savePath, nil
}
