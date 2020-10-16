package video

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// create - Create video
// @Summary Create video
// @Description Create video
// @Tags Videos
// @ID add-video
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param Video Analysis Api Data body videoAnalysisApiData true "Video Analysis Api Data"
// @Success 201 {object} model.Video
// @Failure 400 {array} string
// @Router /api/v1/video [post]
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
		fmt.Println("validationError", validationError)
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}
	tx := model.DB.Begin()
	videoObj := model.Video{}
	videoObj = model.Video{
		Url:       videoAnalysisData.Video.Url,
		Title:     videoAnalysisData.Video.Title,
		Summary:   videoAnalysisData.Video.Summary,
		VideoType: videoAnalysisData.Video.VideoType,
	}
	tx.Create(&videoObj)
	analysisBlocks := []model.VideoAnalysis{}

	for _, analysisBlock := range videoAnalysisData.Analysis {
		analysisBlockObj := model.VideoAnalysis{}
		analysisBlockObj = model.VideoAnalysis{
			VideoID:         videoObj.ID,
			Video:           videoObj,
			RatingValue:     analysisBlock.RatingValue,
			Claim:           analysisBlock.Claim,
			Fact:            analysisBlock.Fact,
			StartTime:       analysisBlock.StartTime,
			EndTime:         analysisBlock.EndTime,
			EndTimeFraction: analysisBlock.EndTimeFraction,
		}
		err = tx.Model(&model.VideoAnalysis{}).Create(&analysisBlockObj).Error
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

	result := map[string]interface{}{"video": videoObj, "analysis": analysisBlocks}
	renderx.JSON(w, http.StatusCreated, result)
}
