package sizeguide

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID
	ImageURL  string
}

type UpdateRequest struct {
	ImageURL string
}
