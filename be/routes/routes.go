package routes

import (
	"be/internal/auth"
	colorpalette "be/internal/color_palette"
	"be/internal/extra_image"
	materialgroup "be/internal/material_group"
	pricematrix "be/internal/price_matrix"
	"be/internal/product"
	productaddon "be/internal/product_addon"
	productimage "be/internal/product_image"
	quantitytier "be/internal/quantity_tier"
	sizeguide "be/internal/size_guide"
	sizevariant "be/internal/size_variant"
	"be/internal/upload"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	r.Static("/uploads", "./uploads")
	p := product.Wire(db)
	mg := materialgroup.Wire(db)
	sv := sizevariant.Wire(db)
	qt := quantitytier.Wire(db)
	pm := pricematrix.Wire(db)
	pa := productaddon.Wire(db)
	pi := productimage.Wire(db)
	ei := extra_image.Wire(db)
	sg := sizeguide.Wire(db)
	cp := colorpalette.Wire(db)
	up := upload.Wire()

	api := r.Group("/api")
	{
		// ─── Auth (public) ──────────────────────────────
		api.POST("/auth/login", auth.Login)
		api.POST("/auth/logout", auth.Logout)
		api.GET("/auth/verify", auth.Verify)

		// ─── Public GET endpoints ───────────────────────
		api.GET("/products", p.GetAll)
		api.GET("/products/:id", p.GetByID)
		api.GET("/material-groups", mg.GetAll)
		api.GET("/size-variants", sv.GetAll)
		api.GET("/quantity-tiers", qt.GetAll)
		api.GET("/price-matrix", pm.GetAll)
		api.GET("/product-addons", pa.GetAll)
		api.GET("/product-images", pi.GetAll)
		api.GET("/product-images/product/:product_id", pi.GetByProduct)
		api.GET("/extra-images", ei.GetAll)
		api.GET("/size-guides/product/:product_id", sg.GetByProduct)
		api.GET("/color-palettes/product/:product_id", cp.GetByProduct)

		// ─── Protected (admin) endpoints ────────────────
		admin := api.Group("")
		admin.Use(auth.AuthMiddleware())
		{
			admin.POST("/products", p.Create)
			admin.PUT("/products/:id", p.Update)
			admin.DELETE("/products/:id", p.Delete)

			admin.POST("/material-groups", mg.Create)
			admin.PUT("/material-groups/:id", mg.Update)
			admin.DELETE("/material-groups/:id", mg.Delete)

			admin.POST("/size-variants", sv.Create)
			admin.PUT("/size-variants/:id", sv.Update)
			admin.DELETE("/size-variants/:id", sv.Delete)

			admin.POST("/quantity-tiers", qt.Create)
			admin.PUT("/quantity-tiers/:id", qt.Update)
			admin.DELETE("/quantity-tiers/:id", qt.Delete)

			admin.POST("/price-matrix", pm.Create)
			admin.PUT("/price-matrix/:id", pm.Update)
			admin.DELETE("/price-matrix/:id", pm.Delete)

			admin.POST("/product-addons", pa.Create)
			admin.PUT("/product-addons/:id", pa.Update)
			admin.DELETE("/product-addons/:id", pa.Delete)

			admin.POST("/product-images", pi.Create)
			admin.PUT("/product-images/:id", pi.Update)
			admin.DELETE("/product-images/:id", pi.Delete)

			admin.POST("/extra-images", ei.Create)
			admin.PUT("/extra-images/:id", ei.Update)
			admin.DELETE("/extra-images/:id", ei.Delete)

			admin.GET("/size-guides", sg.GetAll)
			admin.POST("/size-guides", sg.Create)
			admin.PUT("/size-guides/:id", sg.Update)
			admin.DELETE("/size-guides/:id", sg.Delete)

			admin.GET("/color-palettes", cp.GetAll)
			admin.POST("/color-palettes", cp.Create)
			admin.PUT("/color-palettes/:id", cp.Update)
			admin.DELETE("/color-palettes/:id", cp.Delete)

			admin.POST("/upload", up.Upload)
		}
	}
}
