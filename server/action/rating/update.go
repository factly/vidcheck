package rating

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"gorm.io/gorm"
)

// update - Update rating by id
// @Summary Update a rating by id
// @Description Update rating by ID
// @Tags Rating
// @ID update-rating-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Param Rating body rating false "Rating"
// @Success 200 {object} model.Rating
// @Router /ratings/{rating_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

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

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
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

	result := model.Rating{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.Where(&model.Rating{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// Get table name
	stmt := &gorm.Statement{DB: model.DB}
	_ = stmt.Parse(&model.Rating{})

	// Check if rating with same name exist
	if rating.Name != result.Name && util.CheckName(uint(sID), rating.Name, stmt.Schema.Table) {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
		return
	}

	if rating.NumericValue != result.NumericValue {
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
	}

	tx := model.DB.Begin()
	mediumID := &rating.MediumID
	result.MediumID = &rating.MediumID
	if rating.MediumID == 0 {
		err = tx.Model(&result).Updates(map[string]interface{}{"medium_id": nil}).Error
		mediumID = nil
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	err = tx.Model(&result).Updates(model.Rating{
		Base:             model.Base{UpdatedByID: uint(uID)},
		Name:             rating.Name,
		Slug:             rating.Slug,
		BackgroundColour: rating.BackgroundColour,
		TextColour:       rating.TextColour,
		Description:      rating.Description,
		NumericValue:     rating.NumericValue,
		MediumID:         mediumID,
		HTMLDescription:  description,
		MetaFields:       rating.MetaFields,
	}).Preload("Medium").First(&result).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Update into meili index
	meiliObj := map[string]interface{}{
		"id":                result.ID,
		"kind":              "rating",
		"name":              result.Name,
		"slug":              result.Slug,
		"background_colour": result.BackgroundColour,
		"text_colour":       result.TextColour,
		"description":       result.Description,
		"numeric_value":     result.NumericValue,
		"medium_id":         result.MediumID,
		"space_id":          result.SpaceID,
	}

	err = meilisearchx.UpdateDocument("vidcheck", meiliObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, result)
}
