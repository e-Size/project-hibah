package models

type Product struct {
	Base
	Name        string `json:"name"`
	PricingType string `json:"pricing_type"`
	Description string `json:"description"`
}
