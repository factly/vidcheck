package video

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
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

	uID, err := middlewarex.GetUser(r.Context())
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

	var degaRatingMap map[uint]model.Rating

	if config.DegaIntegrated() {
		degaRatingMap, err = rating.GetDegaRatings(uID, sID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	ratingMap := make(map[int]*model.Rating)

	tx := model.DB.Begin()
	tx.Model(&videoObj).Updates(model.Video{
		Base:      model.Base{UpdatedByID: uint(uID)},
		Title:     videoAnalysisData.Video.Title,
		Summary:   videoAnalysisData.Video.Summary,
		VideoType: videoAnalysisData.Video.VideoType,
		Status:    videoAnalysisData.Video.Status,
	}).First(&videoObj)

	meiliVideoObj := map[string]interface{}{
		"id":             videoObj.ID,
		"kind":           "video",
		"title":          videoObj.Title,
		"url":            videoObj.URL,
		"summary":        videoObj.Summary,
		"video_type":     videoObj.VideoType,
		"status":         videoObj.Status,
		"total_duration": videoObj.TotalDuration,
		"space_id":       videoObj.SpaceID,
	}

	err = meilisearchx.UpdateDocument("vidcheck", meiliVideoObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var updatedOrCreatedVideoBlock []uint
	for _, analysisBlock := range videoAnalysisData.Analysis {
		if analysisBlock.ID != uint(0) {
			// check if new rating exist
			if config.DegaIntegrated() {
				if rat, found := degaRatingMap[analysisBlock.RatingID]; found {
					ratingMap[analysisBlock.EndTime] = &rat
				} else {
					err = errors.New(`rating does not exist in dega`)
				}
			} else {
				rat := model.Rating{}
				rat.ID = analysisBlock.RatingID
				err = tx.First(&rat).Error
			}

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			analysisBlockObj := &model.Analysis{}
			analysisBlockObj.ID = uint(analysisBlock.ID)
			tx.Model(&analysisBlockObj).Updates(model.Analysis{
				Base:          model.Base{UpdatedByID: uint(uID)},
				RatingID:      analysisBlock.RatingID,
				Claim:         analysisBlock.Claim,
				ClaimDate:     analysisBlock.ClaimDate,
				CheckedDate:   analysisBlock.CheckedDate,
				Fact:          analysisBlock.Fact,
				Description:   analysisBlock.Description,
				ReviewSources: analysisBlock.ReviewSources,
				ClaimantID:    analysisBlock.ClaimantID,
				ClaimSources:  analysisBlock.ClaimSources,
				StartTime:     analysisBlock.StartTime,
				EndTime:       analysisBlock.EndTime,
			})

			err = updateAnalysisObjIntoMeili(*analysisBlockObj)
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		} else {
			// check if new rating exist
			if config.DegaIntegrated() {
				if rat, found := degaRatingMap[analysisBlock.RatingID]; found {
					ratingMap[analysisBlock.EndTime] = &rat
				} else {
					err = errors.New(`rating does not exist in dega`)
				}
			} else {
				rat := model.Rating{}
				rat.ID = analysisBlock.RatingID
				err = tx.First(&rat).Error
			}

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			analysisBlockObj := model.Analysis{}
			analysisBlockObj = model.Analysis{
				VideoID:       videoObj.ID,
				RatingID:      analysisBlock.RatingID,
				ClaimantID:    analysisBlock.ClaimantID,
				Claim:         analysisBlock.Claim,
				Fact:          analysisBlock.Fact,
				Description:   analysisBlock.Description,
				ReviewSources: analysisBlock.ReviewSources,
				StartTime:     analysisBlock.StartTime,
				EndTime:       analysisBlock.EndTime,
			}
			err = tx.Model(&model.Analysis{}).Create(&analysisBlockObj).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}

			err = updateAnalysisObjIntoMeili(analysisBlockObj)
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, analysisBlockObj.ID)
		}
	}
	// delete all the videoAnalysisBlocks which is neither updated/created.
	if len(updatedOrCreatedVideoBlock) > 0 {
		analysisBlocks := []model.Analysis{}
		tx.Model(&model.Analysis{}).Not(updatedOrCreatedVideoBlock).Where("video_id = ?", uint(id)).Delete(&analysisBlocks)

		for _, analysis := range analysisBlocks {
			err = meilisearchx.DeleteDocument("vidcheck", analysis.ID, "analysis")
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	tx.Commit()

	// Get all video analysisBlocks.
	analysisBlocks := []model.Analysis{}
	stmt := model.DB.Model(&model.Analysis{}).Order("start_time").Where("video_id = ?", uint(id)).Preload("Claimant")

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&analysisBlocks)

	if config.DegaIntegrated() {
		analysisBlocks = AddDegaRatings(uID, sID, analysisBlocks, degaRatingMap)
	}

	result := videoanalysisData{
		Video:    *videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}

func updateAnalysisObjIntoMeili(analysis model.Analysis) error {
	var claimMeiliDate int64 = 0
	if analysis.ClaimDate != nil {
		claimMeiliDate = analysis.ClaimDate.Unix()
	}
	var checkedMeiliDate int64 = 0
	if analysis.CheckedDate != nil {
		checkedMeiliDate = analysis.CheckedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             analysis.ID,
		"kind":           "analysis",
		"video_id":       analysis.VideoID,
		"rating_id":      analysis.RatingID,
		"claim":          analysis.Claim,
		"description":    analysis.Description,
		"claim_date":     claimMeiliDate,
		"checked_date":   checkedMeiliDate,
		"fact":           analysis.Fact,
		"claimant_id":    analysis.ClaimantID,
		"review_sources": analysis.ReviewSources,
		"end_time":       analysis.EndTime,
		"start_time":     analysis.StartTime,
		"space_id":       analysis.SpaceID,
	}

	return meilisearchx.UpdateDocument("vidcheck", meiliObj)
}
