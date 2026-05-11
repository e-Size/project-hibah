package productaddon

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

func (s *Service) FindAll(productID string) ([]models.ProductAddon, error) {
	var list []models.ProductAddon
	q := s.db
	if productID != "" {
		q = q.Where("product_id = ?", productID)
	}
	err := q.Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.ProductAddon, error) {
	a := models.ProductAddon{
		ProductID: req.ProductID,
		AddonType: req.AddonType,
		AddonName: req.AddonName,
		ExtraFee:  req.ExtraFee,
	}
	err := s.db.Create(&a).Error
	return &a, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.ProductAddon, error) {
	var a models.ProductAddon
	if err := s.db.First(&a, "id = ?", id).Error; err != nil {
		return nil, err
	}
	updates := map[string]any{}
	if req.AddonType != "" {
		updates["addon_type"] = req.AddonType
	}
	if req.AddonName != "" {
		updates["addon_name"] = req.AddonName
	}
	if req.ExtraFee != nil {
		updates["extra_fee"] = *req.ExtraFee
	}
	s.db.Model(&a).Updates(updates)
	return &a, nil
}

func (s *Service) Delete(id string) error {
	var a models.ProductAddon
	if err := s.db.First(&a, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&a).Error
}
