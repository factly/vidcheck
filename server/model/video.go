package model

// Base with id, created_at, updated_at & deleted_at
type Video struct {
	Base
	url         string `gorm:"not null, unique"`
	title       string `gorm:"not null"`
	description string
	VideoType   string
}

type VideoAnalysis struct {
	Base
	VideoID 		int		`gorm:"not null"`
	Video   		Video
	UserID  		int
	User    		User
	RatingValue     string `gorm:"not null"`
	Description     string
	Note			string
}
