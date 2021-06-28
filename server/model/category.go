package model

import (
	"errors"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Category model
type Category struct {
	Base
	Name            string         `gorm:"column:name" json:"name"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	ParentID        *uint          `gorm:"column:parent_id;default:NULL" json:"parent_id"`
	MediumID        *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium          *Medium        `json:"medium"`
	IsFeatured      bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	Videos          []*Video       `gorm:"many2many:video_categories;" json:"videos"`
	Space           *Space         `json:"space,omitempty"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
}

// BeforeSave - validation for medium
func (category *Category) BeforeSave(tx *gorm.DB) (e error) {
	if category.MediumID != nil && *category.MediumID > 0 {
		medium := Medium{}
		medium.ID = *category.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: category.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}

var categoryUser ContextKey = "category_user"

// BeforeCreate hook
func (category *Category) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(categoryUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	category.CreatedByID = uint(uID)
	category.UpdatedByID = uint(uID)
	return nil
}
