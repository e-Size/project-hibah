package models

import "github.com/google/uuid"

type Material struct {
	Base
	MaterialGroupID *uuid.UUID     `json:"material_group_id"`
	Name            string         `json:"name"`
	Description     string         `json:"description"`
	MaterialGroup   *MaterialGroup `json:"material_group,omitempty"`
}
