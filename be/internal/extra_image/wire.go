package extra_image

import (
	"gorm.io/gorm"
)

func Wire(db *gorm.DB) *Handler {
	service := NewService(db)
	return NewHandler(service)
}
