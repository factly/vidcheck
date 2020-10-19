package space

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create space
// @Summary Create space
// @Description Create space
// @Tags Space
// @ID add-space
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param Space body space true "Space Object"
// @Success 201 {object} model.Space
// @Router /spaces [post]
func create(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	space := &space{}

	err = json.NewDecoder(r.Body).Decode(&space)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(space)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	if space.OrganisationID == 0 {
		return
	}

	// Check if the user is owner of organisation
	if isOwner(uID, space.OrganisationID) != nil {
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusUnauthorized,
			Message: "operation not allowed for member",
		}))
		return
	}

	result := model.Space{
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              space.Slug,
		Description:       space.Description,
		TagLine:           space.TagLine,
		SiteAddress:       space.SiteAddress,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		OrganisationID:    space.OrganisationID,
		ContactInfo:       space.ContactInfo,
	}

	err = model.DB.Create(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	renderx.JSON(w, http.StatusCreated, result)
}

func isOwner(uID, oID int) error {
	// Check if the user is owner of organisation
	allOrg, err := getMyOrganisations(uID)
	if err != nil {
		return err
	}

	for _, eachOrg := range allOrg {
		if eachOrg.ID == uint(oID) && eachOrg.Permission.Role == "owner" {
			return nil
		}
	}
	return errors.New("logged in user is not owner")
}
