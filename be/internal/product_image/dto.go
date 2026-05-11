package productimage

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	URL       string    `json:"url" binding:"required"`
	Order     int       `json:"order"`
}

type UpdateRequest struct {
	URL   string `json:"url"`
	Order *int   `json:"order"`
}
