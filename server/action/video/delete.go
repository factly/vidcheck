package video

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
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

	// check record exists or not
	err = model.DB.Where(&model.Video{
		SpaceID: uint(sID),
	}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	err = model.DB.Delete(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
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