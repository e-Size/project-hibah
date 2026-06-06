package models

import "github.com/google/uuid"

type SizeGuide struct {
	Base
	ProductID uuid.UUID `json:"product_id" gorm:"type:uuid;not null;index"`
	Product   Product   `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	ImageURL  string    `json:"image_url" gorm:"not null"`
}
