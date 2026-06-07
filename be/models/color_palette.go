package models

import (
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ColorPalette struct {
	Base
	ProductID uuid.UUID      `json:"product_id" gorm:"type:uuid;not null;index"`
	Product   Product        `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	Colors    pq.StringArray `json:"colors" gorm:"type:text[]"`
}

func (ColorPalette) TableName() string {
	return "color_palettes"
}
