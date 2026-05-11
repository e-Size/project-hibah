package productaddon

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	AddonType string    `json:"addon_type" binding:"required"`
	AddonName string    `json:"addon_name" binding:"required"`
	ExtraFee  int       `json:"extra_fee"`
}

type UpdateRequest struct {
	AddonType string `json:"addon_type"`
	AddonName string `json:"addon_name"`
	ExtraFee  *int   `json:"extra_fee"`
}
