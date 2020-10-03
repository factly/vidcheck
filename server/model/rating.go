package model

// Base with id, created_at, updated_at & deleted_at
type Rating struct {
	Base
	RatingValue     string `gorm:"not null"`
	Description     string
}
