package sizevariant

type CreateRequest struct {
	Code        string `json:"code" binding:"required"`
	Label       string `json:"label" binding:"required"`
	VariantType string `json:"variant_type" binding:"required"`
}

type UpdateRequest struct {
	Code        string `json:"code"`
	Label       string `json:"label"`
	VariantType string `json:"variant_type"`
}
