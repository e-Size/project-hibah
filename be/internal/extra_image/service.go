package extra_image

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

func (s *Service) GetAll() ([]models.ExtraImage, error) {
	var images []models.ExtraImage
	err := s.db.Find(&images).Error
	return images, err
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
