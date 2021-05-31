package model

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Claim model
type Claim struct {
	Base
	VideoID         uint           `gorm:"column:video_id" json:"video_id"`
	Video           *Video         `json:"video"`
	RatingID        uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating          *Rating        `json:"rating"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	Claim           string         `gorm:"column:claim" json:"claim"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	ClaimDate       *time.Time     `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate     *time.Time     `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	Fact            string         `gorm:"column:fact" json:"fact"  swaggertype:"primitive,string"`
	ClaimantID      uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant        *Claimant      `json:"claimant"`
	ReviewSources   postgres.Jsonb `gorm:"column:review_sources" json:"review_sources" swaggertype:"primitive,string"`
	ClaimSources    postgres.Jsonb `gorm:"column:claim_sources" json:"claim_sources" swaggertype:"primitive,string"`
	EndTime         int            `gorm:"column:end_time" json:"end_time"`
	StartTime       int            `gorm:"column:start_time" json:"start_time"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
}

var claimUser ContextKey = "video_user"

// BeforeCreate hook
func (claim *Claim) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(claimUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	claim.CreatedByID = uint(uID)
	claim.UpdatedByID = uint(uID)
	return nil
}
