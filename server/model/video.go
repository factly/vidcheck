package model

// Base with id, created_at, updated_at & deleted_at
type Video struct {
	Base
	Url         string `gorm:"not null,uniqueIndex"`
	Title       string `gorm:"null"`
	Summary     string
	VideoType   string
}
