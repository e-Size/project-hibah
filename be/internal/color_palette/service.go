package colorpalette

import (
	"be/models"
	"errors"

	"github.com/lib/pq"
	"gorm.io/gorm"
)

var ErrProductAlreadyHasPalette = errors.New("product already has a color palette")

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetAll() ([]models.ColorPalette, error) {
	var list []models.ColorPalette
	err := s.db.Order("created_at desc").Find(&list).Error
	return list, err
}

func (s *Service) FindByProduct(productID string) (*models.ColorPalette, error) {
	var palette models.ColorPalette
	if err := s.db.First(&palette, "product_id = ?", productID).Error; err != nil {
		return nil, err
	}
	return &palette, nil
}

func (s *Service) Create(req CreateRequest) (*models.ColorPalette, error) {
	var count int64
	if err := s.db.Model(&models.ColorPalette{}).Where("product_id = ?", req.ProductID).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, ErrProductAlreadyHasPalette
	}

	palette := models.ColorPalette{ProductID: req.ProductID, Colors: pq.StringArray(req.Colors)}
	if err := s.db.Create(&palette).Error; err != nil {
		return nil, err
	}
	return &palette, nil
}

func (s *Service) Update(id string, req UpdateRequest) (*models.ColorPalette, error) {
	var palette models.ColorPalette
	if err := s.db.First(&palette, "id = ?", id).Error; err != nil {
		return nil, err
	}

	if err := s.db.Model(&palette).Update("colors", pq.StringArray(req.Colors)).Error; err != nil {
		return nil, err
	}
	palette.Colors = pq.StringArray(req.Colors)
	return &palette, nil
}

func (s *Service) Delete(id string) error {
	var palette models.ColorPalette
	if err := s.db.First(&palette, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&palette).Error
}
