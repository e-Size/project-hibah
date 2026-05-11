package product

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

func (s *Service) FindAll() ([]models.Product, error) {
	var list []models.Product
	err := s.db.Find(&list).Error
	return list, err
}

func (s *Service) FindByID(id string) (*models.Product, []models.PriceMatrix, map[string][]models.ProductAddon, error) {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, nil, nil, err
	}

	var matrix []models.PriceMatrix
	s.db.Preload("SizeVariant").Preload("QuantityTier").Preload("MaterialGroup").
		Where("product_id = ?", p.ID).Find(&matrix)

	var addons []models.ProductAddon
	s.db.Where("product_id = ?", p.ID).Find(&addons)

	addonMap := make(map[string][]models.ProductAddon)
	for _, a := range addons {
		addonMap[a.AddonType] = append(addonMap[a.AddonType], a)
	}

	return &p, matrix, addonMap, nil
}

func (s *Service) Create(req CreateRequest) (*models.Product, error) {
	p := models.Product{Name: req.Name, PricingType: req.PricingType, Description: req.Description}
	err := s.db.Create(&p).Error
	return &p, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.Product, error) {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, err
	}
	s.db.Model(&p).Updates(req)
	return &p, nil
}

func (s *Service) Delete(id string) error {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&p).Error
}
