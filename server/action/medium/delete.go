package medium

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

// delete - Delete medium by id
// @Summary Delete a medium
// @Description Delete medium by ID
// @Tags Medium
// @ID delete-medium-by-id
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param X-Space header string true "Space ID"
// @Success 200
// @Router /core/media/{medium_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
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

	uintID := uint(id)

	var totAssociated int64

	// check if medium is associated with spaces
	model.DB.Model(&model.Space{}).Where(&model.Space{
		LogoID: &uintID,
	}).Or(&model.Space{
		LogoMobileID: &uintID,
	}).Or(&model.Space{
		FavIconID: &uintID,
	}).Or(&model.Space{
		MobileIconID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with space"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "space")))
		return
	}

	// check if medium is associated with ratings
	model.DB.Model(&model.Rating{}).Where(&model.Rating{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with rating"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "rating")))
		return
	}

	// check if medium is associated with claimants
	model.DB.Model(&model.Claimant{}).Where(&model.Claimant{
		MediumID: &uintID,
	}).Count(&totAssociated)

	if totAssociated != 0 {
		loggerx.Error(errors.New("medium is associated with claimant"))
		errorx.Render(w, errorx.Parser(errorx.CannotDelete("medium", "claimant")))
		return
	}

	tx := model.DB.Begin()
	tx.Delete(&result)

	err = meilisearchx.DeleteDocument("vidcheck", result.ID, "medium")
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx.Commit()

	renderx.JSON(w, http.StatusOK, nil)
}
