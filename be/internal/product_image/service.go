package productimage

import (
	"be/internal/pagination"
	"be/models"

	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetAll(productID string, p pagination.Params) ([]models.ProductImage, int64, error) {
	q := s.db.Model(&models.ProductImage{})
	if productID != "" {
		q = q.Where("product_id = ?", productID)
	}
	q = q.Order("product_id asc, \"order\" asc")

	var total int64
	var list []models.ProductImage

	if p.Limit > 0 {
		q.Count(&total)
		offset := (p.Page - 1) * p.Limit
		if err := q.Limit(p.Limit).Offset(offset).Find(&list).Error; err != nil {
			return nil, 0, err
		}
	} else {
		if err := q.Find(&list).Error; err != nil {
			return nil, 0, err
		}
		total = int64(len(list))
	}
	return list, total, nil
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

func (s *Service) Delete(id string) (string, error) {
	var img models.ProductImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return "", err
	}
	return img.URL, s.db.Delete(&img).Error
}
