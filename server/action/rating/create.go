package rating

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"reflect"

	"gorm.io/gorm"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create rating
// @Summary Create rating
// @Description Create rating
// @Tags Rating
// @ID add-rating
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param Rating body rating true "Rating Object"
// @Success 201 {object} model.Rating
// @Failure 400 {array} string
// @Router /ratings [post]
func create(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	rating := &rating{}

	err = json.NewDecoder(r.Body).Decode(&rating)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(rating)

	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	// Get table name
	stmt := &gorm.Statement{DB: model.DB}
	_ = stmt.Parse(&model.Rating{})

	// Check if rating with same name exist
	if util.CheckName(uint(sID), rating.Name, stmt.Schema.Table) {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	// Check if rating with same numeric value exist
	var sameValueRatings int64
	model.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID:      uint(sID),
		NumericValue: rating.NumericValue,
	}).Count(&sameValueRatings)

	if sameValueRatings > 0 {
		loggerx.Error(errors.New(`rating with same numeric value exist`))
		errorx.Render(w, errorx.Parser(errorx.GetMessage(`rating with same numeric value exist`, http.StatusUnprocessableEntity)))
		return
	}
	mediumID := &rating.MediumID
	if rating.MediumID == 0 {
		mediumID = nil
	}

	// Store HTML description
	var description string
	if len(rating.Description.RawMessage) > 0 && !reflect.DeepEqual(rating.Description, util.NilJsonb()) {
		description, err = util.HTMLDescription(rating.Description)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse rating description", http.StatusUnprocessableEntity)))
			return
		}
	}

	result := &model.Rating{
		Name:             rating.Name,
		Slug:             rating.Slug,
		Description:      rating.Description,
		NumericValue:     rating.NumericValue,
		BackgroundColour: rating.BackgroundColour,
		TextColour:       rating.TextColour,
		SpaceID:          uint(sID),
		MediumID:         mediumID,
		HTMLDescription:  description,
	}

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	err = tx.Model(&model.Rating{}).Create(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Rating{}).Preload("Medium").First(&result)

	err = insertIntoMeili(*result)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, result)
}

func insertIntoMeili(rating model.Rating) error {
	meiliObj := map[string]interface{}{
		"id":                rating.ID,
		"kind":              "rating",
		"name":              rating.Name,
		"background_colour": rating.BackgroundColour,
		"text_colour":       rating.TextColour,
		"slug":              rating.Slug,
		"description":       rating.Description,
		"numeric_value":     rating.NumericValue,
		"medium_id":         rating.MediumID,
		"space_id":          rating.SpaceID,
	}

	return meilisearchx.AddDocument("vidcheck", meiliObj)
}
