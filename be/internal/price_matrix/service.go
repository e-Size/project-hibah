package pricematrix

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

func (s *Service) FindAll(productID string, p pagination.Params) ([]models.PriceMatrix, int64, error) {
	q := s.db.Model(&models.PriceMatrix{}).
		Preload("SizeVariant").Preload("QuantityTier").Preload("MaterialGroup")
	if productID != "" {
		q = q.Where("product_id = ?", productID)
	}

	var total int64
	var list []models.PriceMatrix

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
