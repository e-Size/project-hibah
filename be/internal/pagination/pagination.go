package pagination

import (
	"math"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Params struct {
	Page   int
	Limit  int
	Search string
}

type Meta struct {
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
}

// ParseParams reads page, limit, search from query string.
// Limit=0 means "return all" (no pagination applied).
func ParseParams(c *gin.Context) Params {
	page := 1
	limit := 0

	if v := c.Query("page"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 1 {
			page = n
		}
	}
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n >= 1 && n <= 200 {
			limit = n
		}
	}
	return Params{Page: page, Limit: limit, Search: c.Query("search")}
}

func CalcMeta(total int64, p Params) Meta {
	if p.Limit == 0 {
		return Meta{Total: total, Page: 1, Limit: 0, TotalPages: 1}
	}
	totalPages := int(math.Ceil(float64(total) / float64(p.Limit)))
	if totalPages < 1 {
		totalPages = 1
	}
	return Meta{Total: total, Page: p.Page, Limit: p.Limit, TotalPages: totalPages}
}
