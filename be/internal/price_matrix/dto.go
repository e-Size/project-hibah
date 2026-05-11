package pricematrix

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID       uuid.UUID  `json:"product_id" binding:"required"`
	SizeVariantID   *uuid.UUID `json:"size_variant_id"`
	QuantityTierID  *uuid.UUID `json:"quantity_tier_id"`
	MaterialGroupID *uuid.UUID `json:"material_group_id"`
	Price           int        `json:"price" binding:"required"`
}

type UpdateRequest struct {
	SizeVariantID   *uuid.UUID `json:"size_variant_id"`
	QuantityTierID  *uuid.UUID `json:"quantity_tier_id"`
	MaterialGroupID *uuid.UUID `json:"material_group_id"`
	Price           int        `json:"price"`
}
