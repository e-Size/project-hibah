package colorpalette

import (
	"be/internal/pagination"
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

func (s *Service) GetAll(p pagination.Params) ([]models.ColorPalette, int64, error) {
	q := s.db.Model(&models.ColorPalette{}).Order("created_at desc")

	var total int64
	var list []models.ColorPalette

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
