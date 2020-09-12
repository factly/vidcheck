package model

// Base with id, created_at, updated_at & deleted_at
type User struct {
	Base
	Username  string  `gorm:"column:username" json:"email", unique, index"`
	Email     *string `gorm:"column:email" json:"email"`
	FirstName string  `gorm:"column:first_name" json:"first_name" validate:"required"`
	LastName  *string `gorm:"column:last_name" json:"last_name"`
}
