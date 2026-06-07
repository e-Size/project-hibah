package colorpalette

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	Colors    []string  `json:"colors" binding:"required,min=1,dive,hexcolor"`
}

type UpdateRequest struct {
	Colors []string `json:"colors" binding:"required,min=1,dive,hexcolor"`
}
