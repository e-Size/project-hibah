package product

type CreateRequest struct {
	Name        string `json:"name" binding:"required"`
	PricingType string `json:"pricing_type" binding:"required"`
	Description string `json:"description"`
}

type UpdateRequest struct {
	Name        string `json:"name"`
	PricingType string `json:"pricing_type"`
	Description string `json:"description"`
}
