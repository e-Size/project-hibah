package imgutil

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png" // register PNG decoder and use for encode
	"mime/multipart"
	"os"

	"github.com/google/uuid"
	_ "golang.org/x/image/webp" // register WebP decoder
)

const jpegQual = 80

// CompressAndSave decodes an uploaded image and re-encodes it as a
// compressed JPEG without changing its pixel dimensions.
// It returns the generated filename (always .jpg) or an error.
func CompressAndSave(fh *multipart.FileHeader, destDir string) (string, error) {
	// Open the uploaded file
	src, err := fh.Open()
	if err != nil {
		return "", fmt.Errorf("open uploaded file: %w", err)
	}
	defer src.Close()

	// Decode the image (supports JPEG, PNG, WebP via registered decoders)
	img, format, err := image.Decode(src)
	if err != nil {
		return "", fmt.Errorf("decode image: %w", err)
	}

	// Ensure destination directory exists
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return "", fmt.Errorf("create dir: %w", err)
	}

	// Determine output extension and encoder
	ext := ".jpg"
	if format == "png" {
		ext = ".png"
	}

	filename := uuid.New().String() + ext
	savePath := destDir + "/" + filename

	// Create output file
	out, err := os.Create(savePath)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer out.Close()

	// Encode preserving format
	if format == "png" {
		// For PNG, we don't have quality settings in standard library, but we preserve transparency
		if err := png.Encode(out, img); err != nil {
			os.Remove(savePath)
			return "", fmt.Errorf("encode png: %w", err)
		}
	} else {
		// For JPEG, WebP, etc., encode as JPEG with quality setting
		if err := jpeg.Encode(out, img, &jpeg.Options{Quality: jpegQual}); err != nil {
			os.Remove(savePath)
			return "", fmt.Errorf("encode jpeg: %w", err)
		}
	}

	return filename, nil
}

