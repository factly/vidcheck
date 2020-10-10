package model

type VideoAnalysis struct {
	Base
	VideoID 		uint		`gorm:"not null"`
	Video   		Video
	UserID  		uint
	User    		User
	RatingValue     int     `gorm:"not null"`
	Claim           string
	Fact            string
	EndTime         int
    StartTime       int
    EndTimeFraction float64
}
