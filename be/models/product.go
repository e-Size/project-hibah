package models

type Product struct {
	Base
	Name        string `json:"name"`
	Category    string `json:"category"`    // "pakaian" atau "merch"
	PricingType string `json:"pricing_type"`
	BgColor     string `json:"bg_color"`    // warna background kartu, e.g. "#e8b4a0"
	Keywords    string `json:"keywords"`    // kata kunci pencarian, dipisah koma
	MinQty      int    `json:"min_qty"`     // minimum jumlah order
	Description string `json:"description"`
}
