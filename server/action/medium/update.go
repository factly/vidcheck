package medium

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
)

// update - Update medium by id
// @Summary Update a medium by id
// @Description Update medium by ID
// @Tags Medium
// @ID update-medium-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Param Medium body medium false "Medium"
// @Success 200 {object} model.Medium
// @Router /core/media/{medium_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	medium := &medium{}
	err = json.NewDecoder(r.Body).Decode(&medium)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(medium)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.Medium{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.Where(&model.Medium{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	var mediumSlug string
	// Get table name
	stmt := &gorm.Statement{DB: model.DB}
	_ = stmt.Parse(&model.Medium{})
	tableName := stmt.Schema.Table

	if result.Slug == medium.Slug {
		mediumSlug = result.Slug
	} else if medium.Slug != "" && slugx.Check(medium.Slug) {
		mediumSlug = slugx.Approve(&model.DB, medium.Slug, sID, tableName)
	} else {
		mediumSlug = slugx.Approve(&model.DB, slugx.Make(medium.Name), sID, tableName)
	}

	tx := model.DB.Begin()
	err = tx.Model(&result).Updates(model.Medium{
		Base:        model.Base{UpdatedByID: uint(uID)},
		Name:        medium.Name,
		Slug:        mediumSlug,
		Title:       medium.Title,
		Type:        medium.Type,
		Description: medium.Description,
		AltText:     medium.AltText,
		Caption:     medium.Caption,
		FileSize:    medium.FileSize,
		URL:         medium.URL,
		Dimensions:  medium.Dimensions,
		MetaFields:  medium.MetaFields,
	}).First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "medium",
		"name":        result.Name,
		"slug":        result.Slug,
		"title":       result.Title,
		"type":        result.Type,
		"description": result.Description,
		"space_id":    result.SpaceID,
		"meta_fields": result.MetaFields,
	}

	err = meilisearchx.UpdateDocument(config.AppName, meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, result)
}
