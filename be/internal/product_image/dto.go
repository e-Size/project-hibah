package productimage

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID
	FilePath  string
	Order     int
}

type UpdateRequest struct {
	FilePath string
	Order    *int
}
