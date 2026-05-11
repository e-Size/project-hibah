package material

import "gorm.io/gorm"

func Wire(db *gorm.DB) *Handler {
	return &Handler{service: NewService(db)}
}
