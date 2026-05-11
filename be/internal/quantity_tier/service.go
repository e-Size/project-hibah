package quantitytier

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

func (s *Service) FindAll() ([]models.QuantityTier, error) {
	var list []models.QuantityTier
	err := s.db.Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.QuantityTier, error) {
	t := models.QuantityTier{MinQty: req.MinQty, MaxQty: req.MaxQty, Label: req.Label}
	err := s.db.Create(&t).Error
	return &t, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.QuantityTier, error) {
	var t models.QuantityTier
	if err := s.db.First(&t, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&t).Updates(req)
	return &t, nil
}

func (s *Service) Delete(id string) error {
	var t models.QuantityTier
	if err := s.db.First(&t, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&t).Error
}
