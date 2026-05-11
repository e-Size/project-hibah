package models

import "github.com/google/uuid"

type PriceMatrix struct {
	Base
	ProductID       uuid.UUID      `json:"product_id"`
	SizeVariantID   *uuid.UUID     `json:"size_variant_id"`
	QuantityTierID  *uuid.UUID     `json:"quantity_tier_id"`
	MaterialGroupID *uuid.UUID     `json:"material_group_id"`
	Price           int            `json:"price"`
	SizeVariant     *SizeVariant   `json:"size_variant,omitempty"`
	QuantityTier    *QuantityTier  `json:"quantity_tier,omitempty"`
	MaterialGroup   *MaterialGroup `json:"material_group,omitempty"`
}
