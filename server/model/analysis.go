package model

import "github.com/jinzhu/gorm/dialects/postgres"

// Analysis model
type Analysis struct {
	Base
	VideoID         uint           `gorm:"column:video_id" json:"video_id"`
	Video           *Video         `gorm:"foreignKey:id;references:video_id" json:"video"`
	RatingID        uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating          *Rating        `json:"rating"`
	Claim           string         `json:"claim"`
	Fact            string         `json:"fact"`
	Description     postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ReviewSources   string         `gorm:"column:review_sources" json:"review_sources"`
	EndTime         int            `json:"end_time"`
	StartTime       int            `json:"start_time"`
	EndTimeFraction float64        `json:"end_time_fraction"`
}
