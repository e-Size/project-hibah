package models

import "github.com/google/uuid"

type ProductAddon struct {
	Base
	ProductID uuid.UUID `json:"product_id"`
	AddonType string    `json:"addon_type"`
	AddonName string    `json:"addon_name"`
	ExtraFee  int       `json:"extra_fee"`
}
