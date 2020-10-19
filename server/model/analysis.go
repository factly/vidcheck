package model

// Analysis model
type Analysis struct {
	Base
	VideoID         uint    `gorm:"column:video_id" json:"video_id"`
	Video           Video   `gorm:"foreignKey:id;references:video_id" json:"video"`
	RatingID        uint    `gorm:"column:rating_id" json:"rating_id"`
	Rating          Rating  `json:"rating"`
	Claim           string  `json:"claim"`
	Fact            string  `json:"fact"`
	EndTime         int     `json:"end_time"`
	StartTime       int     `json:"start_time"`
	EndTimeFraction float64 `json:"end_time_fraction"`
}
