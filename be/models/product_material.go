package models

import "github.com/google/uuid"

type ProductMaterial struct {
	Base
	ProductID  uuid.UUID `json:"product_id"`
	MaterialID uuid.UUID `json:"material_id"`
}
