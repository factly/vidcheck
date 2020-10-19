package videoanalysis

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// delete - Delete videoAnalysis by id
// @Summary Delete a videoAnalysis by id
// @Description Delete videoAnalysis by id
// @Tags VideoAnalysis
// @ID delete-video-analysis-by-id
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video_id id path string true "Video ID"
// @Param video_analysis_id path string true "Video Analysis ID"
// @Success 200
// @Failure 400 {array} string
// @Router /analysis/video/{video_id}/analysis/{video_analysis_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Analysis{}
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
