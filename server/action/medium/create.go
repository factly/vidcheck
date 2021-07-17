package medium

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/vidcheck/util"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/slugx"
	"github.com/factly/x/validationx"
	"gorm.io/gorm"
)

// create - Create medium
// @Summary Create medium
// @Description Create medium
// @Tags Medium
// @ID add-medium
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Medium body []medium true "Medium Object"
// @Success 201 {object} []model.Medium
// @Failure 400 {array} string
// @Router /core/media [post]
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

	var mediumList []medium

	err = json.NewDecoder(r.Body).Decode(&mediumList)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Medium, 0)

	for _, medium := range mediumList {
		validationError := validationx.Check(medium)

		if validationError != nil {
			loggerx.Error(errors.New("validation error"))
			errorx.Render(w, validationError)
			return
		}

		var mediumSlug string
		if medium.Slug != "" && slugx.Check(medium.Slug) {
			mediumSlug = medium.Slug
		} else {
			mediumSlug = slugx.Make(medium.Name)
		}

		// Get table name
		stmt := &gorm.Statement{DB: model.DB}
		_ = stmt.Parse(&model.Medium{})
		tableName := stmt.Schema.Table

		med := model.Medium{
			Name:        medium.Name,
			Slug:        slugx.Approve(&model.DB, mediumSlug, sID, tableName),
			Title:       medium.Title,
			Type:        medium.Type,
			Description: medium.Description,
			Caption:     medium.Caption,
			AltText:     medium.AltText,
			FileSize:    medium.FileSize,
			URL:         medium.URL,
			Dimensions:  medium.Dimensions,
			SpaceID:     uint(sID),
			MetaFields:  medium.MetaFields,
		}

		result.Nodes = append(result.Nodes, med)
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Medium{}).Create(&result.Nodes).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for i := range result.Nodes {

		// Insert into meili index
		meiliObj := map[string]interface{}{
			"id":          result.Nodes[i].ID,
			"kind":        "medium",
			"name":        result.Nodes[i].Name,
			"slug":        result.Nodes[i].Slug,
			"title":       result.Nodes[i].Title,
			"type":        result.Nodes[i].Type,
			"description": result.Nodes[i].Description,
			"space_id":    result.Nodes[i].SpaceID,
			"meta_fields": result.Nodes[i].MetaFields,
		}

		err = meilisearchx.AddDocument("vidcheck", meiliObj)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	result.Total = int64(len(result.Nodes))

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}
