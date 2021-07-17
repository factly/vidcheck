package model

import (
	"errors"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Claimant model
type Claimant struct {
	Base
	Name            string         `gorm:"column:name" json:"name"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	MediumID        *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium          *Medium        `json:"medium"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	TagLine         string         `gorm:"column:tag_line" json:"tag_line"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
}

var claimantUser ContextKey = "claimant_user"

// BeforeCreate hook
func (claimant *Claimant) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(claimantUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	claimant.CreatedByID = uint(uID)
	claimant.UpdatedByID = uint(uID)
	return nil
}

// BeforeSave - validation for medium
func (claimant *Claimant) BeforeSave(tx *gorm.DB) (e error) {
	if claimant.MediumID != nil && *claimant.MediumID > 0 {
		medium := Medium{}
		medium.ID = *claimant.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: claimant.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}
