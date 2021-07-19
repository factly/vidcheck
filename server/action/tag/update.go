package tag

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
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

// update - Update tag by id
// @Summary Update a tag by id
// @Description Update tag by ID
// @Tags Tag
// @ID update-tag-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param tag_id path string true "Tag ID"
// @Param X-Space header string true "Space ID"
// @Param Tag body tag false "Tag"
// @Success 200 {object} model.Tag
// @Router /tags/{tag_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	tagID := chi.URLParam(r, "tag_id")
	id, err := strconv.Atoi(tagID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

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

	result := &model.Tag{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.Where(&model.Tag{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tag := &tag{}
	err = json.NewDecoder(r.Body).Decode(&tag)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(tag)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	var tagSlug string

	// Get table name
	stmt := &gorm.Statement{DB: model.DB}
	_ = stmt.Parse(&model.Tag{})
	tableName := stmt.Schema.Table

	if result.Slug == tag.Slug {
		tagSlug = result.Slug
	} else if tag.Slug != "" && slugx.Check(tag.Slug) {
		tagSlug = slugx.Approve(&model.DB, tag.Slug, sID, tableName)
	} else {
		tagSlug = slugx.Approve(&model.DB, slugx.Make(tag.Name), sID, tableName)
	}

	// Check if tag with same name exist
	if tag.Name != result.Name && util.CheckName(uint(sID), tag.Name, tableName) {
		loggerx.Error(errors.New(`tag with same name exist`))
		errorx.Render(w, errorx.Parser(errorx.SameNameExist()))
		return
	}

	// Store HTML description
	var description string
	if len(tag.Description.RawMessage) > 0 && !reflect.DeepEqual(tag.Description, util.NilJsonb()) {
		description, err = util.HTMLDescription(tag.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse tag description", http.StatusUnprocessableEntity)))
			return
		}
	}

	tx := model.DB.Begin()

	tx.Model(&result).Select("IsFeatured").Updates(model.Tag{IsFeatured: tag.IsFeatured})
	err = tx.Model(&result).Updates(model.Tag{
		Base:            model.Base{UpdatedByID: uint(uID)},
		Name:            tag.Name,
		Slug:            tagSlug,
		Description:     tag.Description,
		HTMLDescription: description,
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":          result.ID,
		"kind":        "tag",
		"name":        result.Name,
		"slug":        result.Slug,
		"description": result.Description,
		"space_id":    result.SpaceID,
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
