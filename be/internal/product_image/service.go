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

func (s *Service) FindByProduct(productID string) ([]models.ProductImage, error) {
	var list []models.ProductImage
	err := s.db.Where("product_id = ?", productID).Order("\"order\" asc").Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.ProductImage, error) {
	img := models.ProductImage{
		ProductID: req.ProductID,
		URL:       req.URL,
		Order:     req.Order,
	}
	err := s.db.Create(&img).Error
	return &img, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.ProductImage, error) {
	var img models.ProductImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return nil, err
	}
	updates := map[string]any{}
	if req.URL != "" {
		updates["url"] = req.URL
	}
	if req.Order != nil {
		updates["order"] = *req.Order
	}
	s.db.Model(&img).Updates(updates)
	return &img, nil
}

func (s *Service) Delete(id string) error {
	var img models.ProductImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&img).Error
}
