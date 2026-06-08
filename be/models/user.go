package models

type User struct {
	Base
	Username     string `json:"username" gorm:"uniqueIndex;not null"`
	PasswordHash string `json:"-"        gorm:"column:password_hash;not null"`
	Role         string `json:"role"     gorm:"default:'admin'"`
}
