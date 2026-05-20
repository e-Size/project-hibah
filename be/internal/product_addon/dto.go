package productaddon

import "github.com/google/uuid"

type CreateRequest struct {
	ProductID uuid.UUID `json:"product_id" binding:"required"`
	AddonType string    `json:"addon_type" binding:"required"` // "tipe", "bahan", "warna", dll
	AddonName string    `json:"addon_name" binding:"required"`
	ExtraFee  int       `json:"extra_fee"`
	ColorHex  string    `json:"color_hex"` // untuk addon_type "warna", e.g. "#111111"
	ImageURL  string    `json:"image_url"` // untuk addon_type "bahan", URL gambar material
	Desc      string    `json:"desc"`      // untuk addon_type "bahan", deskripsi material
}

type UpdateRequest struct {
	AddonType string `json:"addon_type"`
	AddonName string `json:"addon_name"`
	ExtraFee  *int   `json:"extra_fee"`
	ColorHex  string `json:"color_hex"`
	ImageURL  string `json:"image_url"`
	Desc      string `json:"desc"`
}
