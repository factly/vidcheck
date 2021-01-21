package model

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Analysis model
type Analysis struct {
	Base
	VideoID         uint           `gorm:"column:video_id" json:"video_id"`
	Video           *Video         `json:"video"`
	RatingID        uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating          *Rating        `json:"rating"`
	Claim           postgres.Jsonb `gorm:"column:claim" json:"claim"  swaggertype:"primitive,string"`
	ClaimDate       time.Time      `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate     time.Time      `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	IsClaim         bool           `gorm:"column:is_claim" json:"is_claim"`
	Fact            postgres.Jsonb `gorm:"column:fact" json:"fact"  swaggertype:"primitive,string"`
	ClaimantID      uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant        *Claimant      `json:"claimant"`
	ReviewSources   postgres.Jsonb `gorm:"column:review_sources" json:"review_sources" swaggertype:"primitive,string"`
	ClaimSources    postgres.Jsonb `gorm:"column:claim_sources" json:"claim_sources" swaggertype:"primitive,string"`
	EndTime         int            `gorm:"column:end_time" json:"end_time"`
	StartTime       int            `gorm:"column:start_time" json:"start_time"`
	EndTimeFraction float64        `gorm:"column:end_time_fraction" json:"end_time_fraction"`
}
