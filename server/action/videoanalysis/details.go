package videoanalysis

import (
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get videosAnalysis by id
// @Summary Show a videosAnalysis by id
// @Description Get videosAnalysis by ID
// @Tags VideoAnalysis
// @ID get-video-analysis-by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video_id id path string true "Video ID"
// @Param video_analysis_id path string true "Video Analysis ID"
// @Success 200 {object} model.Analysis
// @Failure 400 {array} string
// @Router /analysis/video/{video_id}/analysis/{video_analysis_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Analysis{}
	result.ID = uint(id)

	err = model.DB.Model(&model.Analysis{}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}
