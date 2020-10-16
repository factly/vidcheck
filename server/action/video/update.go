package video

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

// update - Update video by id
// @Summary Update a video by id
// @Description Update video by ID
// @Tags Videos
// @ID update-video-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param video_id path string true "Video ID"
// @Param Video Analysis Api Data body videoAnalysisApiData true "Video Analysis Api Data"
// @Success 200 {object} model.Video
// @Failure 400 {array} string
// @Router /api/v1/video/{video_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	videoAnalysisData := &videoAnalysisApiData{}
	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

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

	videoObj := &model.Video{}
	videoObj.ID = uint(id)

	err = model.DB.First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.Begin()
	tx.Model(&videoObj).Updates(model.Video{
		Title:     videoAnalysisData.Video.Title,
		Summary:   videoAnalysisData.Video.Summary,
		VideoType: videoAnalysisData.Video.VideoType,
	}).First(&videoObj)

	var updatedOrCreatedVideoBlock []uint
	for _, analysisBlock := range videoAnalysisData.Analysis {
		if analysisBlock.Id != uint(0) {
			analysisBlockObj := &model.VideoAnalysis{}
			analysisBlockObj.ID = uint(analysisBlock.Id)
			tx.Model(&analysisBlockObj).Updates(model.VideoAnalysis{
				RatingValue:     analysisBlock.RatingValue,
				Claim:           analysisBlock.Claim,
				Fact:            analysisBlock.Fact,
				StartTime:       analysisBlock.StartTime,
				EndTime:         analysisBlock.EndTime,
				EndTimeFraction: analysisBlock.EndTimeFraction,
			}).First(&analysisBlockObj)
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		} else {
			analysisBlockObj := model.VideoAnalysis{}
			analysisBlockObj = model.VideoAnalysis{
				VideoID:         videoObj.ID,
				Video:           *videoObj,
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
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		}
	}
	// delete all the videoAnalysisBlocks which is neither updated/created.
	if len(updatedOrCreatedVideoBlock) > 0 {
		analysisBlocks := []model.VideoAnalysis{}
		tx.Model(&model.VideoAnalysis{}).Not(updatedOrCreatedVideoBlock).Where("video_id = ?", uint(id)).Delete(&analysisBlocks)
	}

	tx.Commit()

	// Get all video analysisBlocks.
	analysisBlocks := []model.VideoAnalysis{}
	model.DB.Model(&model.VideoAnalysis{}).Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks)
	result := map[string]interface{}{"video": videoObj, "analysis": analysisBlocks}
	renderx.JSON(w, http.StatusOK, result)
}
