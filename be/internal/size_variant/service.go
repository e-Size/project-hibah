package sizevariant

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

func (s *Service) FindAll() ([]models.SizeVariant, error) {
	var list []models.SizeVariant
	err := s.db.Find(&list).Error
	return list, err
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
