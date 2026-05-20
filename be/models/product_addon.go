package models

import "github.com/google/uuid"

type ProductAddon struct {
	Base
	ProductID uuid.UUID `json:"product_id"`
	AddonType string    `json:"addon_type"` // "tipe", "bahan", "warna", dll
	AddonName string    `json:"addon_name"`
	ExtraFee  int       `json:"extra_fee"`
	ColorHex  string    `json:"color_hex"`  // untuk addon_type "warna", e.g. "#111111"
	ImageURL  string    `json:"image_url"`  // untuk addon_type "bahan", URL gambar material
	Desc      string    `json:"desc"`       // untuk addon_type "bahan", deskripsi material
}
