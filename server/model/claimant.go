package model

import (
	"github.com/jinzhu/gorm/dialects/postgres"
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
