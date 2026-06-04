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
	err := s.db.Find(&list).Error
	return list, err
}

func (s *Service) Create(req CreateRequest) (*models.MaterialGroup, error) {
	g := models.MaterialGroup{Name: req.Name, ImageURL: req.ImageURL}
	err := s.db.Create(&g).Error
	return &g, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.MaterialGroup, string, error) {
	var g models.MaterialGroup
	if err := s.db.First(&g, "id = ?", id).Error; err != nil {
		return nil, "", err
	}

	oldPath := ""
	if req.ImageURL != "" && req.ImageURL != g.ImageURL {
		oldPath = g.ImageURL
	}

	s.db.Model(&g).Updates(req)
	return &g, oldPath, nil
}

func (s *Service) Delete(id string) (string, error) {
	var g models.MaterialGroup
	if err := s.db.First(&g, "id = ?", id).Error; err != nil {
		return "", err
	}
	return g.ImageURL, s.db.Delete(&g).Error
}
