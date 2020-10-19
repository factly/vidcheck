package model

// Rating model
type Rating struct {
	Base
	Name         string `gorm:"column:name" json:"name"`
	Slug         string `gorm:"column:slug" json:"slug"`
	Description  string `gorm:"column:description" json:"description"`
	NumericValue int    `gorm:"column:numeric_value" json:"numeric_value"`
	SpaceID      uint   `gorm:"column:space_id" json:"space_id"`
}
