package claimant

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"reflect"

	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create claimant
// @Summary Create claimant
// @Description Create claimant
// @Tags Claimant
// @ID add-claimant
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Claimant body claimant true "Claimant Object"
// @Success 201 {object} model.Claimant
// @Failure 400 {array} string
// @Router /claimants [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	claimant := &claimant{}

	err = json.NewDecoder(r.Body).Decode(&claimant)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(claimant)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	mediumID := &claimant.MediumID
	if claimant.MediumID == 0 {
		mediumID = nil
	}

	var description string
	// Store HTML description
	if len(claimant.Description.RawMessage) > 0 && !reflect.DeepEqual(claimant.Description, util.NilJsonb()) {
		description, err = util.HTMLDescription(claimant.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claimant description", http.StatusUnprocessableEntity)))
			return
		}
	}

	result := &model.Claimant{
		Name:            claimant.Name,
		Slug:            claimant.Slug,
		Description:     claimant.Description,
		SpaceID:         uint(sID),
		TagLine:         claimant.TagLine,
		MediumID:        mediumID,
		HTMLDescription: description,
		MetaFields:      claimant.MetaFields,
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()

	err = tx.Model(&model.Claimant{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Claimant{}).Preload("Medium").First(&result)

	// Insert into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "claimant",
		"name":        result.Name,
		"slug":        result.Slug,
		"description": result.Description,
		"tag_line":    result.TagLine,
		"space_id":    result.SpaceID,
		"medium_id":   mediumID,
		"meta_fields": result.MetaFields,
	}

	err = meilisearchx.AddDocument(config.AppName, meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
