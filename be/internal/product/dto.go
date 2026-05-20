package product

import "be/models"

type CreateRequest struct {
	Name        string `json:"name" binding:"required"`
	Category    string `json:"category" binding:"required"` // "pakaian" atau "merch"
	PricingType string `json:"pricing_type" binding:"required"`
	BgColor     string `json:"bg_color"`
	Keywords    string `json:"keywords"`
	MinQty      int    `json:"min_qty"`
	Description string `json:"description"`
}

type UpdateRequest struct {
	Name        string `json:"name"`
	Category    string `json:"category"`
	PricingType string `json:"pricing_type"`
	BgColor     string `json:"bg_color"`
	Keywords    string `json:"keywords"`
	MinQty      *int   `json:"min_qty"`
	Description string `json:"description"`
}

// ProductListItem adalah response untuk listing produk, termasuk thumbnail gambar pertama
type ProductListItem struct {
	models.Product
	Thumbnail string `json:"thumbnail"`
}
