package model

// Base with id, created_at, updated_at & deleted_at
type Organisation struct {
	Base
	Name  string    `gorm:"column:organisation" json:"organisation", unique, index"`
}
