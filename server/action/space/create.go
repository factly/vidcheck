package space

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/spf13/viper"
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
	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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

	err = util.CheckSpaceKetoPermission("create", uint(space.OrganisationID), uint(uID))
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage(err.Error(), http.StatusUnauthorized)))
		return
	}

	var superOrgID int
	if viper.GetBool("create_super_organisation") {
		superOrgID, err = middlewarex.GetSuperOrganisationID("vidcheck")
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		// Fetch organisation permissions
		permission := model.OrganisationPermission{}
		err = model.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
			OrganisationID: uint(space.OrganisationID),
		}).First(&permission).Error

		if err != nil && space.OrganisationID != superOrgID {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
			return
		}

		if err == nil {
			// Fetch total number of spaces in organisation
			var totSpaces int64
			model.DB.Model(&model.Space{}).Where(&model.Space{
				OrganisationID: space.OrganisationID,
			}).Count(&totSpaces)

			if totSpaces >= permission.Spaces && permission.Spaces > 0 {
				errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot create more spaces", http.StatusUnprocessableEntity)))
				return
			}
		}
	}

	var spaceSlug string
	if space.Slug != "" && slugx.Check(space.Slug) {
		spaceSlug = space.Slug
	} else {
		spaceSlug = slugx.Make(space.Name)
	}

	result := model.Space{
		Name:              space.Name,
		SiteTitle:         space.SiteTitle,
		Slug:              approveSpaceSlug(spaceSlug),
		Description:       space.Description,
		TagLine:           space.TagLine,
		SiteAddress:       space.SiteAddress,
		Analytics:         space.Analytics,
		VerificationCodes: space.VerificationCodes,
		SocialMediaURLs:   space.SocialMediaURLs,
		OrganisationID:    space.OrganisationID,
		ContactInfo:       space.ContactInfo,
		HeaderCode:        space.HeaderCode,
		FooterCode:        space.FooterCode,
		MetaFields:        space.MetaFields,
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	if viper.GetBool("create_super_organisation") {
		// Create SpacePermission for super organisation
		var spacePermission model.SpacePermission
		if superOrgID == space.OrganisationID {
			spacePermission = model.SpacePermission{
				SpaceID: result.ID,
				Media:   -1,
				Videos:  -1,
			}
		} else {
			spacePermission = model.SpacePermission{
				SpaceID: result.ID,
				Media:   viper.GetInt64("default_number_of_media"),
				Videos:  viper.GetInt64("default_number_of_vidoes"),
			}
		}
		var spacePermContext model.ContextKey = "space_perm_user"
		if err = tx.WithContext(context.WithValue(r.Context(), spacePermContext, uID)).Create(&spacePermission).Error; err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}

	}

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":              result.ID,
		"kind":            "space",
		"name":            result.Name,
		"slug":            result.Slug,
		"description":     result.Description,
		"site_title":      result.SiteTitle,
		"site_address":    result.SiteAddress,
		"tag_line":        result.TagLine,
		"organisation_id": result.OrganisationID,
		"analytics":       result.Analytics,
		"header_code":     result.HeaderCode,
		"footer_code":     result.FooterCode,
		"meta_fields":     result.MetaFields,
	}

	err = meilisearchx.AddDocument("vidcheck", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}

func approveSpaceSlug(slug string) string {
	spaceList := make([]model.Space, 0)
	model.DB.Model(&model.Space{}).Where("slug LIKE ? AND deleted_at IS NULL", slug+"%").Find(&spaceList)

	count := 0
	for {
		flag := true
		for _, each := range spaceList {
			temp := slug
			if count != 0 {
				temp = temp + "-" + strconv.Itoa(count)
			}
			if each.Slug == temp {
				flag = false
				break
			}
		}
		if flag {
			break
		}
		count++
	}
	temp := slug
	if count != 0 {
		temp = temp + "-" + strconv.Itoa(count)
	}
	return temp
}
