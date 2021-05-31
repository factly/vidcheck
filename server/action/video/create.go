package video

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"reflect"

	"github.com/factly/dega-server/test"
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

	uID, err := middlewarex.GetUser(r.Context())
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
	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	videoObj := model.Video{}
	videoObj = model.Video{
		URL:           videoAnalysisData.Video.URL,
		Title:         videoAnalysisData.Video.Title,
		Summary:       videoAnalysisData.Video.Summary,
		VideoType:     videoAnalysisData.Video.VideoType,
		TotalDuration: videoAnalysisData.Video.TotalDuration,
		Status:        "published", // status is set to published videoAnalysisData.Video.Status
		SpaceID:       uint(sID),
	}
	err = tx.Create(&videoObj).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	err = insertVideoIntoMeili(videoObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	analysisBlocks := []model.Analysis{}
	ratingMap := make(map[int]*model.Rating)
	var degaRatingMap map[uint]model.Rating

	if config.DegaIntegrated() {
		degaRatingMap, err = rating.GetDegaRatings(uID, sID)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	for _, analysisBlock := range videoAnalysisData.Analysis {

		// check if associated rating exist
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

		// Store HTML description
		var description string
		if len(analysisBlock.Description.RawMessage) > 0 && !reflect.DeepEqual(analysisBlock.Description, test.NilJsonb()) {
			description, err = util.HTMLDescription(analysisBlock.Description)
			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse analysisBlock description", http.StatusUnprocessableEntity)))
				return
			}
		}

		analysisBlockObj := model.Analysis{
			VideoID:         videoObj.ID,
			RatingID:        analysisBlock.RatingID,
			Claim:           analysisBlock.Claim,
			ClaimDate:       analysisBlock.ClaimDate,
			CheckedDate:     analysisBlock.CheckedDate,
			Fact:            analysisBlock.Fact,
			Description:     analysisBlock.Description,
			ClaimantID:      analysisBlock.ClaimantID,
			ReviewSources:   analysisBlock.ReviewSources,
			ClaimSources:    analysisBlock.ClaimSources,
			StartTime:       analysisBlock.StartTime,
			EndTime:         analysisBlock.EndTime,
			HTMLDescription: description,
			SpaceID:         uint(sID),
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

	for _, analysis := range analysisBlocks {
		var claimMeiliDate int64 = 0
		if analysis.ClaimDate != nil {
			claimMeiliDate = analysis.ClaimDate.Unix()
		}
		var checkedMeiliDate int64 = 0
		if analysis.CheckedDate != nil {
			checkedMeiliDate = analysis.CheckedDate.Unix()
		}
		err = insertAnalysisIntoMeili(analysis, claimMeiliDate, checkedMeiliDate)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	stmt := tx.Model(&model.Analysis{}).Order("start_time").Where("video_id = ?", videoObj.ID).Preload("Claimant")

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&analysisBlocks)

	tx.Commit()

	if config.DegaIntegrated() {
		for i := range analysisBlocks {
			analysisBlocks[i].Rating = ratingMap[analysisBlocks[i].EndTime]
		}
	}

	result := videoanalysisData{
		Video:    videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusCreated, result)
}

func insertVideoIntoMeili(video model.Video) error {
	meiliObj := map[string]interface{}{
		"id":             video.ID,
		"kind":           "video",
		"title":          video.Title,
		"url":            video.URL,
		"summary":        video.Summary,
		"video_type":     video.VideoType,
		"status":         video.Status,
		"total_duration": video.TotalDuration,
		"space_id":       video.SpaceID,
	}

	return meilisearchx.AddDocument("vidcheck", meiliObj)
}

func insertAnalysisIntoMeili(analysis model.Analysis, claimMeiliDate int64, checkedMeiliDate int64) error {
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

	return meilisearchx.AddDocument("vidcheck", meiliObj)
}
