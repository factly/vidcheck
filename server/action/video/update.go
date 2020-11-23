package video

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
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
// @Param X-Space header string true "Space ID"
// @Param video_id path string true "Video ID"
// @Param Video Analysis Api Data body videoanalysisReqData true "Video Analysis Api Data"
// @Success 200 {object} model.Video
// @Failure 400 {array} string
// @Router /videos/{video_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
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

	videoObj := &model.Video{}
	videoObj.ID = uint(id)

	// Check if video exist
	err = model.DB.Where(&model.Video{
		SpaceID: uint(sID),
	}).First(&videoObj).Error
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
		Status:    videoAnalysisData.Video.Status,
	}).First(&videoObj)

	var updatedOrCreatedVideoBlock []uint
	for _, analysisBlock := range videoAnalysisData.Analysis {
		if analysisBlock.ID != uint(0) {
			analysisBlockObj := &model.Analysis{}
			analysisBlockObj.ID = uint(analysisBlock.ID)
			tx.Model(&analysisBlockObj).Updates(model.Analysis{
				RatingID:        analysisBlock.RatingID,
				Claim:           analysisBlock.Claim,
				Fact:            analysisBlock.Fact,
				StartTime:       analysisBlock.StartTime,
				EndTime:         analysisBlock.EndTime,
				EndTimeFraction: analysisBlock.EndTimeFraction,
			})
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		} else {
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
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		}
	}
	// delete all the videoAnalysisBlocks which is neither updated/created.
	if len(updatedOrCreatedVideoBlock) > 0 {
		analysisBlocks := []model.Analysis{}
		tx.Model(&model.Analysis{}).Not(updatedOrCreatedVideoBlock).Where("video_id = ?", uint(id)).Delete(&analysisBlocks)
	}

	tx.Commit()

	// Get all video analysisBlocks.
	analysisBlocks := []model.Analysis{}
	model.DB.Model(&model.Analysis{}).Preload("Rating").Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks)

	result := videoanalysisData{
		Video:    *videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}
