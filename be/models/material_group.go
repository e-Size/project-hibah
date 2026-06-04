package models

type MaterialGroup struct {
	Base
	Name      string     `json:"name"`
	ImageURL string `json:"image_url"`
}
