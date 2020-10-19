package videoanalysis

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create videoAnalysis
// @Summary Create videoAnalysis
// @Description Create videoAnalysis
// @Tags VideoAnalysis
// @ID add-video-analysis
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param Video Analysis Data body videoAnalysisApiData true "Video Analysis Api Data"
// @Success 201 {object} model.Video
// @Failure 400 {array} string
// @Router /analysis [post]
func create(w http.ResponseWriter, r *http.Request) {
	videoAnalysisData := &videoAnalysisApiData{}
	err := json.NewDecoder(r.Body).Decode(&videoAnalysisData)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(videoAnalysisData)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	tx := model.DB.Begin()
	videoObj := model.Video{}
	videoObj = model.Video{
		URL:       videoAnalysisData.Video.URL,
		Title:     videoAnalysisData.Video.Title,
		Summary:   videoAnalysisData.Video.Summary,
		VideoType: videoAnalysisData.Video.VideoType,
	}
	tx.Model(&model.Video{}).Create(&videoObj)
	analysisBlocks := []model.Analysis{}

	for _, analysisBlock := range videoAnalysisData.Analysis {
		analysisBlockObj := model.Analysis{}
		analysisBlockObj = model.Analysis{
			VideoID:         videoObj.ID,
			RatingID:        analysisBlock.RatingID,
			Claim:           analysisBlock.Claim,
			Fact:            analysisBlock.Fact,
			StartTime:       analysisBlock.StartTime,
			EndTime:         analysisBlock.EndTime,
			EndTimeFraction: analysisBlock.EndTimeFraction,
		}
		err = tx.Model(&model.Analysis{}).Create(&analysisBlockObj).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
		analysisBlocks = append(analysisBlocks, analysisBlockObj)
	}
	tx.Commit()
	renderx.JSON(w, http.StatusCreated, videoObj)
}
