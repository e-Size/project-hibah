package materialgroup

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

func (s *Service) FindAll(p pagination.Params) ([]models.MaterialGroup, int64, error) {
	q := s.db.Model(&models.MaterialGroup{})
	if p.Search != "" {
		q = q.Where("name ILIKE ?", "%"+p.Search+"%")
	}

	var total int64
	var list []models.MaterialGroup

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
