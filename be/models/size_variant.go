package models

type SizeVariant struct {
	Base
	Code        string `json:"code"`
	Label       string `json:"label"`
	VariantType string `json:"variant_type"`
}
