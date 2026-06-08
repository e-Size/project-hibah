package sizeguide

import (
	"be/internal/pagination"
	"be/models"
	"errors"

	"gorm.io/gorm"
)

var ErrProductAlreadyHasSizeGuide = errors.New("product already has a size guide")

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetAll(p pagination.Params) ([]models.SizeGuide, int64, error) {
	q := s.db.Model(&models.SizeGuide{}).Order("created_at desc")

	var total int64
	var list []models.SizeGuide

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

func (s *Service) FindByProduct(productID string) (*models.SizeGuide, error) {
	var guide models.SizeGuide
	if err := s.db.First(&guide, "product_id = ?", productID).Error; err != nil {
		return nil, err
	}
	return &guide, nil
}

func (s *Service) Create(req CreateRequest) (*models.SizeGuide, error) {
	var count int64
	if err := s.db.Model(&models.SizeGuide{}).Where("product_id = ?", req.ProductID).Count(&count).Error; err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, ErrProductAlreadyHasSizeGuide
	}

	guide := models.SizeGuide{ProductID: req.ProductID, ImageURL: req.ImageURL}
	if err := s.db.Create(&guide).Error; err != nil {
		return nil, err
	}
	return &guide, nil
}

func (s *Service) Update(id string, req UpdateRequest) (*models.SizeGuide, string, error) {
	var guide models.SizeGuide
	if err := s.db.First(&guide, "id = ?", id).Error; err != nil {
		return nil, "", err
	}

	oldPath := guide.ImageURL
	if err := s.db.Model(&guide).Update("image_url", req.ImageURL).Error; err != nil {
		return nil, "", err
	}
	guide.ImageURL = req.ImageURL
	return &guide, oldPath, nil
}

func (s *Service) Delete(id string) (string, error) {
	var guide models.SizeGuide
	if err := s.db.First(&guide, "id = ?", id).Error; err != nil {
		return "", err
	}
	return guide.ImageURL, s.db.Delete(&guide).Error
}
