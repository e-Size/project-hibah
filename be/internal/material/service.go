package material

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

func (s *Service) FindAll() ([]models.Material, error) {
	var list []models.Material
	err := s.db.Preload("MaterialGroup").Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.Material, error) {
	m := models.Material{
		MaterialGroupID: req.MaterialGroupID,
		Name:            req.Name,
		Description:     req.Description,
	}
	err := s.db.Create(&m).Error
	return &m, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.Material, error) {
	var m models.Material
	if err := s.db.First(&m, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&m).Updates(req)
	return &m, nil
}

func (s *Service) Delete(id string) error {
	var m models.Material
	if err := s.db.First(&m, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&m).Error
}
