package models

type MaterialGroup struct {
	Base
	Name      string     `json:"name"`
	Materials []Material `json:"materials,omitempty"`
}
