package sizevariant

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

func (s *Service) FindAll(p pagination.Params) ([]models.SizeVariant, int64, error) {
	q := s.db.Model(&models.SizeVariant{})
	if p.Search != "" {
		q = q.Where("code ILIKE ? OR label ILIKE ? OR variant_type ILIKE ?",
			"%"+p.Search+"%", "%"+p.Search+"%", "%"+p.Search+"%")
	}

	var total int64
	var list []models.SizeVariant

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

func (s *Service) Create(req CreateRequest) (*models.SizeVariant, error) {
	v := models.SizeVariant{Code: req.Code, Label: req.Label, VariantType: req.VariantType}
	err := s.db.Create(&v).Error
	return &v, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.SizeVariant, error) {
	var v models.SizeVariant
	if err := s.db.First(&v, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&v).Updates(req)
	return &v, nil
}

func (s *Service) Delete(id string) error {
	var v models.SizeVariant
	if err := s.db.First(&v, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&v).Error
}
