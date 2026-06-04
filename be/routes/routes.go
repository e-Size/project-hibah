package routes

import (
	"be/internal/extra_image"
	materialgroup "be/internal/material_group"
	"be/internal/material"
	"be/internal/product"
	productaddon "be/internal/product_addon"
	productimage "be/internal/product_image"
	pricematrix "be/internal/price_matrix"
	quantitytier "be/internal/quantity_tier"
	sizevariant "be/internal/size_variant"
	"be/internal/upload"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(r *gin.Engine, db *gorm.DB) {
	r.Static("/uploads", "./uploads")
	p := product.Wire(db)
	mg := materialgroup.Wire(db)
	m := material.Wire(db)
	sv := sizevariant.Wire(db)
	qt := quantitytier.Wire(db)
	pm := pricematrix.Wire(db)
	pa := productaddon.Wire(db)
	pi := productimage.Wire(db)
	ei := extra_image.Wire(db)
	up := upload.Wire()

	api := r.Group("/api")
	{
		products := api.Group("/products")
		{
			products.GET("", p.GetAll)
			products.GET("/:id", p.GetByID)
			products.POST("", p.Create)
			products.PUT("/:id", p.Update)
			products.DELETE("/:id", p.Delete)
		}

		materialGroups := api.Group("/material-groups")
		{
			materialGroups.GET("", mg.GetAll)
			materialGroups.POST("", mg.Create)
			materialGroups.PUT("/:id", mg.Update)
			materialGroups.DELETE("/:id", mg.Delete)
		}

		materials := api.Group("/materials")
		{
			materials.GET("", m.GetAll)
			materials.POST("", m.Create)
			materials.PUT("/:id", m.Update)
			materials.DELETE("/:id", m.Delete)
		}

		sizeVariants := api.Group("/size-variants")
		{
			sizeVariants.GET("", sv.GetAll)
			sizeVariants.POST("", sv.Create)
			sizeVariants.PUT("/:id", sv.Update)
			sizeVariants.DELETE("/:id", sv.Delete)
		}

		quantityTiers := api.Group("/quantity-tiers")
		{
			quantityTiers.GET("", qt.GetAll)
			quantityTiers.POST("", qt.Create)
			quantityTiers.PUT("/:id", qt.Update)
			quantityTiers.DELETE("/:id", qt.Delete)
		}

		priceMatrix := api.Group("/price-matrix")
		{
			priceMatrix.GET("", pm.GetAll)
			priceMatrix.POST("", pm.Create)
			priceMatrix.PUT("/:id", pm.Update)
			priceMatrix.DELETE("/:id", pm.Delete)
		}

		productAddons := api.Group("/product-addons")
		{
			productAddons.GET("", pa.GetAll)
			productAddons.POST("", pa.Create)
			productAddons.PUT("/:id", pa.Update)
			productAddons.DELETE("/:id", pa.Delete)
		}

		productImages := api.Group("/product-images")
		{
			productImages.GET("", pi.GetAll)
			productImages.GET("/product/:product_id", pi.GetByProduct)
			productImages.POST("", pi.Create)
			productImages.PUT("/:id", pi.Update)
			productImages.DELETE("/:id", pi.Delete)
		}

		extraImages := api.Group("/extra-images")
		{
			extraImages.GET("", ei.GetAll)
			extraImages.POST("", ei.Create)
			extraImages.PUT("/:id", ei.Update)
			extraImages.DELETE("/:id", ei.Delete)
		}

		api.POST("/upload", up.Upload)
	}
}
