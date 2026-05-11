package material

import "github.com/google/uuid"

type CreateRequest struct {
	MaterialGroupID *uuid.UUID `json:"material_group_id"`
	Name            string     `json:"name" binding:"required"`
	Description     string     `json:"description"`
}

type UpdateRequest struct {
	MaterialGroupID *uuid.UUID `json:"material_group_id"`
	Name            string     `json:"name"`
	Description     string     `json:"description"`
}
