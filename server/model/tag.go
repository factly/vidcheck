package model

import (
	"errors"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Tag model
type Tag struct {
	Base
	Name            string         `gorm:"column:name" json:"name" validate:"required"`
	Slug            string         `gorm:"column:slug" json:"slug" validate:"required"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	IsFeatured      bool           `gorm:"column:is_featured" json:"is_featured"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	Space           *Space         `json:"space,omitempty"`
	Videos          []*Video       `gorm:"many2many:video_tags;" json:"videos"`
	MediumID        *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium          *Medium        `json:"medium"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
}

var tagUser ContextKey = "tag_user"

// BeforeCreate hook
func (tag *Tag) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(tagUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	tag.CreatedByID = uint(uID)
	tag.UpdatedByID = uint(uID)
	return nil
}

// BeforeSave - validation for medium
func (tag *Tag) BeforeSave(tx *gorm.DB) (e error) {
	if tag.MediumID != nil && *tag.MediumID > 0 {
		medium := Medium{}
		medium.ID = *tag.MediumID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: tag.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}
