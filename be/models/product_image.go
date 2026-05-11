package models

import "github.com/google/uuid"

type ProductImage struct {
	Base
	ProductID uuid.UUID `json:"product_id"`
	URL       string    `json:"url"`
	Order     int       `json:"order"`
}
