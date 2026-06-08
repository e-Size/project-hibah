package extra_image

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

func (s *Service) GetAll(p pagination.Params) ([]models.ExtraImage, int64, error) {
	q := s.db.Model(&models.ExtraImage{})
	if p.Search != "" {
		q = q.Where("name ILIKE ? OR description ILIKE ?", "%"+p.Search+"%", "%"+p.Search+"%")
	}

	var total int64
	var list []models.ExtraImage

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

func (s *Service) Create(req CreateRequest) (models.ExtraImage, error) {
	img := models.ExtraImage{
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
	}
	err := s.db.Create(&img).Error
	return img, err
}

func (s *Service) Update(id string, req UpdateRequest) (models.ExtraImage, string, error) {
	var img models.ExtraImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return img, "", err
	}

	oldPath := ""
	if req.ImageURL != "" && req.ImageURL != img.ImageURL {
		oldPath = img.ImageURL
		img.ImageURL = req.ImageURL
	}

	if req.Name != "" {
		img.Name = req.Name
	}
	if req.Description != "" {
		img.Description = req.Description
	}

	err := s.db.Save(&img).Error
	return img, oldPath, err
}

func (s *Service) Delete(id string) (string, error) {
	var img models.ExtraImage
	if err := s.db.First(&img, "id = ?", id).Error; err != nil {
		return "", err
	}
	return img.ImageURL, s.db.Delete(&img).Error
}
