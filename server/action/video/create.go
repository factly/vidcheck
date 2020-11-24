package video

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
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
// @Param X-Space header string true "Space ID"
// @Param Video Analysis Api Data body videoanalysisReqData true "Video Analysis Api Data"
// @Success 201 {object} videoanalysisData
// @Failure 400 {array} string
// @Router /videos [post]
func create(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	videoAnalysisData := &videoanalysisReqData{}
	err = json.NewDecoder(r.Body).Decode(&videoAnalysisData)
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
		Status:    videoAnalysisData.Video.Status,
		SpaceID:   uint(sID),
	}
	err = tx.Create(&videoObj).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	analysisBlocks := []model.Analysis{}

	for _, analysisBlock := range videoAnalysisData.Analysis {

		// check if rating exist

		analysisBlockObj := model.Analysis{
			VideoID:         videoObj.ID,
			RatingID:        analysisBlock.RatingID,
			Claim:           analysisBlock.Claim,
			Fact:            analysisBlock.Fact,
			Description:     analysisBlock.Description,
			ReviewSources:   analysisBlock.ReviewSources,
			StartTime:       analysisBlock.StartTime,
			EndTime:         analysisBlock.EndTime,
			EndTimeFraction: analysisBlock.EndTimeFraction,
		}
		analysisBlocks = append(analysisBlocks, analysisBlockObj)
	}

	err = tx.Create(&analysisBlocks).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Model(&model.Analysis{}).Preload("Rating").Order("start_time").Where("video_id = ?", videoObj.ID).Find(&analysisBlocks)

	tx.Commit()

	result := videoanalysisData{
		Video:    videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusCreated, result)
}
