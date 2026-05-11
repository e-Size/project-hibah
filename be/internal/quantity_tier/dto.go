package quantitytier

type CreateRequest struct {
	MinQty int    `json:"min_qty" binding:"required"`
	MaxQty int    `json:"max_qty"`
	Label  string `json:"label" binding:"required"`
}

type UpdateRequest struct {
	MinQty int    `json:"min_qty"`
	MaxQty int    `json:"max_qty"`
	Label  string `json:"label"`
}
