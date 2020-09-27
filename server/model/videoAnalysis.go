package model

type VideoAnalysis struct {
	Base
	VideoID 		int		`gorm:"not null"`
	Video   		Video
	UserID  		int
	User    		User
	Status          string
	RatingValue     int     `gorm:"not null"`
	Description     string
	Note			string
	EndTime         int
    StartTime       int
}
