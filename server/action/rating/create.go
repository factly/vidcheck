package rating

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

	// Check if rating with same name exist
	// if util.CheckName(uint(sID), rating.Name, config.DB.NewScope(&model.Rating{}).TableName()) {
	// 	loggerx.Error(err)
	// 	errorx.Render(w, errorx.Parser(errorx.CannotSaveChanges()))
	// 	return
	// }

	result := &model.Rating{
		Name:         rating.Name,
		Slug:         rating.Slug,
		Description:  rating.Description,
		NumericValue: rating.NumericValue,
		SpaceID:      uint(sID),
	}

	err = model.DB.Model(&model.Rating{}).Create(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusCreated, result)
}
