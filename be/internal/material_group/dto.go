package materialgroup

type CreateRequest struct {
	Name     string `json:"name" binding:"required"`
	ImageURL string `json:"image_url"`
}

type UpdateRequest struct {
	Name     string `json:"name"`
	ImageURL string `json:"image_url"`
}
