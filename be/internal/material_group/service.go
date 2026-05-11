package materialgroup

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

func (s *Service) FindAll() ([]models.MaterialGroup, error) {
	var list []models.MaterialGroup
	err := s.db.Preload("Materials").Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.MaterialGroup, error) {
	g := models.MaterialGroup{Name: req.Name}
	err := s.db.Create(&g).Error
	return &g, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.MaterialGroup, error) {
	var g models.MaterialGroup
	if err := s.db.First(&g, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&g).Updates(req)
	return &g, nil
}

func (s *Service) Delete(id string) error {
	var g models.MaterialGroup
	if err := s.db.First(&g, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&g).Error
}
