package imgutil

import (
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png" // register PNG decoder
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
	img, _, err := image.Decode(src)
	if err != nil {
		return "", fmt.Errorf("decode image: %w", err)
	}

	// Ensure destination directory exists
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return "", fmt.Errorf("create dir: %w", err)
	}

	// Generate a unique .jpg filename
	filename := uuid.New().String() + ".jpg"
	savePath := destDir + "/" + filename

	// Create output file
	out, err := os.Create(savePath)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer out.Close()

	// Encode as JPEG with quality setting (compress file size, keep original dimensions)
	if err := jpeg.Encode(out, img, &jpeg.Options{Quality: jpegQual}); err != nil {
		os.Remove(savePath)
		return "", fmt.Errorf("encode jpeg: %w", err)
	}

	return filename, nil
}

