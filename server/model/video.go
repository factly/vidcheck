package model

// Video model
type Video struct {
	Base
	URL       string `gorm:"column:url not null,uniqueIndex" json:"url"`
	Title     string `gorm:"column:title null" json:"title"`
	Summary   string `gorm:"column:summary" json:"summary"`
	VideoType string `gorm:"column:video_type" json:"video_type"`
	SpaceID   uint   `gorm:"column:space_id" json:"space_id"`
}
