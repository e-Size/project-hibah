package productaddon

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

func (s *Service) FindAll(productID string, addonType string, p pagination.Params) ([]models.ProductAddon, int64, error) {
	q := s.db.Model(&models.ProductAddon{})
	if productID != "" {
		q = q.Where("product_id = ?", productID)
	}
	if addonType != "" {
		q = q.Where("addon_type = ?", addonType)
	}
	if p.Search != "" {
		q = q.Where("addon_name ILIKE ?", "%"+p.Search+"%")
	}

	var total int64
	var list []models.ProductAddon

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

func (s *Service) Create(req CreateRequest) (*models.ProductAddon, error) {
	a := models.ProductAddon{
		ProductID: req.ProductID,
		AddonType: req.AddonType,
		AddonName: req.AddonName,
		ExtraFee:  req.ExtraFee,
		ColorHex:  req.ColorHex,
		ImageURL:  req.ImageURL,
		Desc:      req.Desc,
	}
	err := s.db.Create(&a).Error
	return &a, err
}

func (s *Service) Update(id string, req UpdateRequest) (*models.ProductAddon, string, error) {
	var a models.ProductAddon
	if err := s.db.First(&a, "id = ?", id).Error; err != nil {
		return nil, "", err
	}

	oldPath := ""
	if req.ImageURL != "" && req.ImageURL != a.ImageURL {
		oldPath = a.ImageURL
	}

	updates := map[string]any{}
	if req.AddonType != "" {
		updates["addon_type"] = req.AddonType
	}
	if req.AddonName != "" {
		updates["addon_name"] = req.AddonName
	}
	if req.ExtraFee != nil {
		updates["extra_fee"] = *req.ExtraFee
	}
	if req.ColorHex != "" {
		updates["color_hex"] = req.ColorHex
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.Desc != "" {
		updates["desc"] = req.Desc
	}
	s.db.Model(&a).Updates(updates)
	return &a, oldPath, nil
}

func (s *Service) Delete(id string) (string, error) {
	var a models.ProductAddon
	if err := s.db.First(&a, "id = ?", id).Error; err != nil {
		return "", err
	}
	return a.ImageURL, s.db.Delete(&a).Error
}
