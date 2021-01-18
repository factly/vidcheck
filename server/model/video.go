package model

// Video model
type Video struct {
	Base
	URL           string `gorm:"column:url;unique;not null" json:"url"`
	Title         string `gorm:"column:title;not null" json:"title"`
	Summary       string `gorm:"column:summary" json:"summary"`
	VideoType     string `gorm:"column:video_type" json:"video_type"`
	Status        string `gorm:"column:status" json:"status"`
	SpaceID       uint   `gorm:"column:space_id" json:"space_id"`
	TotalDuration int64  `gorm:"column:total_duration" json:"total_duration"`
}
