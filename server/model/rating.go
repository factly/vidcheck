package model

import (
	"errors"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Rating model
type Rating struct {
	Base
	Name             string         `gorm:"column:name" json:"name"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	Description      string         `gorm:"column:description" json:"description"`
	MediumID         *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium           *Medium        `json:"medium"`
	NumericValue     int            `gorm:"column:numeric_value" json:"numeric_value"`
	BackgroundColour postgres.Jsonb `gorm:"column:background_colour" json:"background_colour" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb `gorm:"column:text_colour" json:"text_colour" swaggertype:"primitive,string"`
	SpaceID          uint           `gorm:"column:space_id" json:"space_id"`
}

var ratingUser ContextKey = "rating_user"

// BeforeCreate hook
func (rating *Rating) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(ratingUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	rating.CreatedByID = uint(uID)
	rating.UpdatedByID = uint(uID)
	return nil
}

// BeforeSave - validation for medium
func (rating *Rating) BeforeSave(tx *gorm.DB) (e error) {

	if rating.MediumID != nil && *rating.MediumID > 0 {
		medium := Medium{}
		medium.ID = *rating.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: rating.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same space")
		}
	}
	return nil
}
