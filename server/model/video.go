package model

// Base with id, created_at, updated_at & deleted_at
type Video struct {
	Base
	Url         string `gorm:"not null, unique"`
	Title       string `gorm:"null"`
	TotalTime   int    `gorm:"not null"`
	Description string
	VideoType   string
}
