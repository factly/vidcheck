package video

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/renderx"
)

// delete - Delete video by id
// @Summary Delete a video
// @Description Delete video by ID
// @Tags Videos
// @ID delete-video-by-id
// @Consume  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param video_id path string true "Video ID"
// @Success 200
// @Failure 400 {array} string
// @Router /videos/{video_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	videoID := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Video{}
	result.ID = uint(id)
	claimBlocks := []model.Claim{}

	// check record exists or not
	err = model.DB.Where(&model.Video{
		SpaceID: uint(sID),
	}).Preload("Tags").Preload("Categories").First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.Begin()

	// delete all associations
	if len(result.Tags) > 0 {
		_ = tx.Model(&result).Association("Tags").Delete(result.Tags)
	}
	if len(result.Categories) > 0 {
		_ = tx.Model(&result).Association("Categories").Delete(result.Categories)
	}

	tx.Model(&model.VideoAuthor{}).Where(&model.VideoAuthor{
		VideoID: uint(id),
	}).Delete(&model.VideoAuthor{})

	err = tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = meilisearchx.DeleteDocument("vidcheck", result.ID, "video")
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Model(&model.Claim{}).Where("video_id = ?", result.ID).Find(&claimBlocks).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for _, claim := range claimBlocks {
		err = meilisearchx.DeleteDocument("vidcheck", claim.ID, "claim")
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	err = tx.Model(&model.Claim{}).Where("video_id = ?", result.ID).Delete(&model.Claim{}).Error

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
