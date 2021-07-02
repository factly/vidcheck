package model

import (
	"gorm.io/gorm"
)

// Video model
type Video struct {
	Base
	URL           string     `gorm:"column:url;not null" json:"url"`
	Title         string     `gorm:"column:title;not null" json:"title"`
	Summary       string     `gorm:"column:summary" json:"summary"`
	VideoType     string     `gorm:"column:video_type" json:"video_type"`
	SpaceID       uint       `gorm:"column:space_id" json:"space_id"`
	Status        string     `gorm:"status" json:"status"`
	TotalDuration int        `gorm:"total_duration" json:"total_duration"`
	ThumbnailURL  string     `gorm:"column:thumbnail_url" json:"thumbnail_url"`
	Tags          []Tag      `gorm:"many2many:video_tags;" json:"tags"`
	Categories    []Category `gorm:"many2many:video_categories;" json:"categories"`
}

var videoUser ContextKey = "video_user"

// BeforeCreate hook
func (video *Video) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(videoUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	video.CreatedByID = uint(uID)
	video.UpdatedByID = uint(uID)
	return nil
}
