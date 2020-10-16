package video

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// delete - Delete video by id
// @Summary Delete a video
// @Description Delete video by ID
// @Tags Videos
// @ID delete-video-by-id
// @Consume  json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video_id path string true "Video ID"
// @Success 200
// @Failure 400 {array} string
// @Router /api/v1/video/{video_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Video{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.Begin()
	err = tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}

// func getUserAndOrganisation(r *http.Request) map[string]uint {
//     userId, err := strconv.ParseUint(r.Header.Get("X-User-ID"))
//     organisationId, err := strconv.ParseUint(r.Header.Get("X-Organisation-ID"))
//
// //     userId := r.Header.Get("X-User-ID")
// //     organisationId := r.Header.Get("X-Organisation-ID")
//     userAndOrgData := make(map[string]uint)
//     userAndOrgData["user_id"] = userId
//     userAndOrgData["organisation_id"] = organisationId
//     return userAndOrgData
// }
