package video

import (
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get video by id
// @Summary Show a video by id
// @Description Get video by ID
// @Tags Videos
// @ID get-video by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video id path string true "Video ID"
// @Success 200 {object} model.Video
// @Failure 400 {array} string
// @Router /api/v1/video/{video_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	videoObj := &model.Video{}
	videoObj.ID = uint(id)
	analysisBlocks := []model.VideoAnalysis{}
	err = model.DB.Model(&model.Video{}).First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	err = model.DB.Model(&model.VideoAnalysis{}).Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	result := map[string]interface{}{"video": videoObj, "analysis": analysisBlocks}
	renderx.JSON(w, http.StatusOK, result)
}
