package quantitytier

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

func (s *Service) FindAll(p pagination.Params) ([]models.QuantityTier, int64, error) {
	q := s.db.Model(&models.QuantityTier{})
	if p.Search != "" {
		q = q.Where("label ILIKE ?", "%"+p.Search+"%")
	}

	var total int64
	var list []models.QuantityTier

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
