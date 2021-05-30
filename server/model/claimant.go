package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Claimant model
type Claimant struct {
	Base
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Description postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	TagLine     string         `gorm:"column:tag_line" json:"tag_line"`
	SpaceID     uint           `gorm:"column:space_id" json:"space_id"`
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
