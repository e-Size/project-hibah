package models

type QuantityTier struct {
	Base
	MinQty int    `json:"min_qty"`
	MaxQty int    `json:"max_qty"`
	Label  string `json:"label"`
}
