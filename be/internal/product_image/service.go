package productimage

import (
	"be/models"

	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetAll() ([]models.ProductImage, error) {
	var list []models.ProductImage
	err := s.db.Order("product_id asc, \"order\" asc").Find(&list).Error
	return list, err
}

func (s *Service) FindByProduct(productID string) ([]models.ProductImage, error) {
	var list []models.ProductImage
	err := s.db.Where("product_id = ?", productID).Order("\"order\" asc").Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.ProductImage, error) {
	img := models.ProductImage{
		ProductID: req.ProductID,
		URL:       req.FilePath,
		Order:     req.Order,
	}
	err := s.db.Create(&img).Error
	return &img, err
}

// Update returns the updated record and the old file path (if the file was replaced).
func (s *Service) Update(id string, req UpdateRequest) (*models.ProductImage, string, error) {
	var img models.ProductImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return nil, "", err
	}
	oldPath := img.URL
	updates := map[string]any{}
	if req.FilePath != "" {
		updates["url"] = req.FilePath
	}
	if req.Order != nil {
		updates["order"] = *req.Order
	}
	if err := s.db.Model(&img).Updates(updates).Error; err != nil {
		return nil, "", err
	}
	return &img, oldPath, nil
}

// Delete removes the record and returns the file path for the caller to clean up.
func (s *Service) Delete(id string) (string, error) {
	var img models.ProductImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return "", err
	}
	return img.URL, s.db.Delete(&img).Error
}
