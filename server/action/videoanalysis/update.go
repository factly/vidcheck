package videoanalysis

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
)

// update - Update videosAnalysis by id
// @Summary Update a videosAnalysis by id
// @Description Update videosAnalysis by ID
// @Tags VideoAnalysis
// @ID update-video-analysis-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video_id id path string true "Video ID"
// @Param video_analysis_id path string true "Video Analysis ID"
// @Param Video Analysis Data body videoAnalysis true "Video Analysis Data"
// @Success 200 {object} model.VideoAnalysis
// @Failure 400 {array} string
// @Router /api/v1/analyse/video/{video_id}/analysis/{video_analysis_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	videoAnalysis := &videoAnalysis{}

	err = json.NewDecoder(r.Body).Decode(&videoAnalysis)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(videoAnalysis)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.VideoAnalysis{}
	result.ID = uint(id)

	err = model.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Model(&result).Updates(model.VideoAnalysis{
		RatingValue:     videoAnalysis.RatingValue,
		Claim:           videoAnalysis.Claim,
		Fact:            videoAnalysis.Fact,
		StartTime:       videoAnalysis.StartTime,
		EndTime:         videoAnalysis.EndTime,
		EndTimeFraction: videoAnalysis.EndTimeFraction,
	}).First(&result)

	renderx.JSON(w, http.StatusOK, result)
}
