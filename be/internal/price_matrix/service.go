package pricematrix

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

func (s *Service) FindAll() ([]models.PriceMatrix, error) {
	var list []models.PriceMatrix
	err := s.db.Preload("SizeVariant").Preload("QuantityTier").Preload("MaterialGroup").
		Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.PriceMatrix, error) {
	m := models.PriceMatrix{
		ProductID:       req.ProductID,
		SizeVariantID:   req.SizeVariantID,
		QuantityTierID:  req.QuantityTierID,
		MaterialGroupID: req.MaterialGroupID,
		Price:           req.Price,
	}
	err := s.db.Create(&m).Error
	return &m, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.PriceMatrix, error) {
	var m models.PriceMatrix
	if err := s.db.First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&m).Updates(map[string]any{
		"size_variant_id":   req.SizeVariantID,
		"quantity_tier_id":  req.QuantityTierID,
		"material_group_id": req.MaterialGroupID,
		"price":             req.Price,
	})
	return &m, nil
}

func (s *Service) Delete(id string) error {
	var m models.PriceMatrix
	if err := s.db.First(&m, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&m).Error
}
