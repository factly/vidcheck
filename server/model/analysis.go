package model

// Analysis model
type Analysis struct {
	Base
	VideoID         uint    `gorm:"column:video_id" json:"video_id"`
	Video           *Video  `json:"video"`
	RatingID        uint    `gorm:"column:rating_id" json:"rating_id"`
	Rating          *Rating `json:"rating"`
	Claim           string  `gorm:"column:claim" json:"claim"`
	Fact            string  `gorm:"column:fact" json:"fact"`
	EndTime         int     `gorm:"column:end_time" json:"end_time"`
	StartTime       int     `gorm:"column:start_time" json:"start_time"`
	EndTimeFraction float64 `gorm:"column:end_time_fraction" json:"end_time_fraction"`
}
