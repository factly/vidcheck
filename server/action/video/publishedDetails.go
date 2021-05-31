package video

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/editorx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get published video by id
// @Summary Show a published video by id
// @Description Get published video by ID
// @Tags Videos
// @ID get-published-video-by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param video_id path string true "Video ID"
// @Success 200 {object} videoResData
// @Failure 400 {array} string
// @Router /videos/{video_id}/published [get]
func publishedDetails(w http.ResponseWriter, r *http.Request) {
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

	videoObj := &model.Video{}
	videoObj.ID = uint(id)
	claimBlocks := make([]model.Claim, 0)
	err = model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
		Status:  "published",
	}).First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Model(&model.Claim{}).Preload("Rating").Order("start_time").Where("video_id = ?", uint(id)).Find(&claimBlocks)

	for index, each := range claimBlocks {

		arrByte, err := each.Description.MarshalJSON()

		desc := make(map[string]interface{})
		err = json.Unmarshal(arrByte, &desc)

		if err == nil {
			html, _ := editorx.EditorjsToHTML(desc)
			claimBlocks[index].HTMLDescription = html
		}

	}

	result := videoResData{
		Video:  *videoObj,
		Claims: claimBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}
