package product

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

func (s *Service) FindAll(category string, p pagination.Params) ([]ProductListItem, int64, error) {
	q := s.db.Model(&models.Product{})
	if category != "" {
		q = q.Where("category = ?", category)
	}
	if p.Search != "" {
		q = q.Where("name ILIKE ? OR keywords ILIKE ?", "%"+p.Search+"%", "%"+p.Search+"%")
	}

	var total int64
	var list []models.Product

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

	if len(list) == 0 {
		return []ProductListItem{}, total, nil
	}

	ids := make([]string, len(list))
	for i, p := range list {
		ids[i] = p.ID.String()
	}

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
	return result, total, nil
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
