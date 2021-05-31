package rating

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete rating by id
// @Summary Delete a rating
// @Description Delete rating by ID
// @Tags Rating
// @ID delete-rating-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Success 200
// @Router /ratings/{rating_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Rating{}

	result.ID = uint(id)

	// check record exists or not
	err = model.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	// check if rating is associated with analysis
	var totAssociated int64
	model.DB.Model(&model.Claim{}).Where(&model.Claim{
		RatingID: uint(id),
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("rating is associated with claim"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("rating", "claim")))
		return
	}

	tx := model.DB.Begin()
	tx.Model(&model.Rating{}).Delete(&result)

	err = meilisearchx.DeleteDocument("vidcheck", result.ID, "rating")
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
