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

func (s *Service) FindAll(category string) ([]ProductListItem, error) {
	var list []models.Product
	q := s.db
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if err := q.Find(&list).Error; err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return []ProductListItem{}, nil
	}

	ids := make([]string, len(list))
	for i, p := range list {
		ids[i] = p.ID.String()
	}

	// Ambil gambar pertama (thumbnail) untuk setiap produk
	var images []models.ProductImage
	s.db.Where("product_id IN ?", ids).Order(`"order" asc`).Find(&images)

	thumbMap := make(map[string]string)
	for _, img := range images {
		pid := img.ProductID.String()
		if _, exists := thumbMap[pid]; !exists {
			thumbMap[pid] = img.URL
		}
	}

	result := make([]ProductListItem, len(list))
	for i, p := range list {
		result[i] = ProductListItem{
			Product:   p,
			Thumbnail: thumbMap[p.ID.String()],
		}
	}
	return result, nil
}

func (s *Service) FindByID(id string) (*models.Product, []models.ProductImage, []models.PriceMatrix, map[string][]models.ProductAddon, error) {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, nil, nil, nil, err
	}

	var images []models.ProductImage
	s.db.Where("product_id = ?", p.ID).Order(`"order" asc`).Find(&images)

	var matrix []models.PriceMatrix
	s.db.Preload("SizeVariant").Preload("QuantityTier").Preload("MaterialGroup").
		Where("product_id = ?", p.ID).Find(&matrix)

	var addons []models.ProductAddon
	s.db.Where("product_id = ?", p.ID).Find(&addons)

	addonMap := make(map[string][]models.ProductAddon)
	for _, a := range addons {
		addonMap[a.AddonType] = append(addonMap[a.AddonType], a)
	}

	return &p, images, matrix, addonMap, nil
}

func (s *Service) Create(req CreateRequest) (*models.Product, error) {
	p := models.Product{
		Name:        req.Name,
		Category:    req.Category,
		PricingType: req.PricingType,
		BgColor:     req.BgColor,
		Keywords:    req.Keywords,
		MinQty:      req.MinQty,
		Description: req.Description,
	}
	err := s.db.Create(&p).Error
	return &p, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.Product, error) {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return nil, err
	}
	updates := map[string]any{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.PricingType != "" {
		updates["pricing_type"] = req.PricingType
	}
	if req.BgColor != "" {
		updates["bg_color"] = req.BgColor
	}
	if req.Keywords != "" {
		updates["keywords"] = req.Keywords
	}
	if req.MinQty != nil {
		updates["min_qty"] = *req.MinQty
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	s.db.Model(&p).Updates(updates)
	return &p, nil
}

func (s *Service) Delete(id string) error {
	var p models.Product
	if err := s.db.First(&p, "id = ?", id).Error; err != nil {
		return err
	}
	return s.db.Delete(&p).Error
}
