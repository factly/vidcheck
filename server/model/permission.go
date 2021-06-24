package model

import (
	"gorm.io/gorm"
)

// OrganisationPermission model
type OrganisationPermission struct {
	Base
	OrganisationID uint  `gorm:"column:organisation_id" json:"organisation_id"`
	Spaces         int64 `gorm:"column:spaces" json:"spaces"`
}

// SpacePermission model
type SpacePermission struct {
	Base
	SpaceID uint   `gorm:"column:space_id" json:"space_id"`
	Space   *Space `gorm:"foreignKey:space_id" json:"space,omitempty"`
	Media   int64  `gorm:"column:media" json:"media"`
	Videos  int64  `gorm:"column:videos" json:"videos"`
}

var spacePermissionUser ContextKey = "space_perm_user"
var organisationPermissionUser ContextKey = "org_perm_user"

// BeforeCreate hook
func (op *OrganisationPermission) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(organisationPermissionUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	op.CreatedByID = uint(uID)
	op.UpdatedByID = uint(uID)
	return nil
}

// BeforeCreate hook
func (sp *SpacePermission) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(spacePermissionUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	sp.CreatedByID = uint(uID)
	sp.UpdatedByID = uint(uID)
	return nil
}
