package video

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/factly/vidcheck/action/rating"

	"github.com/factly/vidcheck/config"

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

	uID, err := util.GetUser(r.Context())
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
	ratingMap := make(map[float64]*model.Rating)
	var degaRatingMap map[uint]model.Rating

	if config.DegaIntegrated() {
		degaRatingMap, err = rating.GetDegaRatings(uID, sID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	for _, analysisBlock := range videoAnalysisData.Analysis {

		// check if associated rating exist
		if config.DegaIntegrated() {
			if rat, found := degaRatingMap[analysisBlock.RatingID]; found {
				ratingMap[analysisBlock.EndTimeFraction] = &rat
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

		analysisBlockObj := model.Analysis{
			VideoID:         videoObj.ID,
			RatingID:        analysisBlock.RatingID,
			Claim:           analysisBlock.Claim,
			Fact:            analysisBlock.Fact,
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

	stmt := tx.Model(&model.Analysis{}).Order("start_time").Where("video_id = ?", videoObj.ID)

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&analysisBlocks)

	tx.Commit()

	if config.DegaIntegrated() {
		for i := range analysisBlocks {
			analysisBlocks[i].Rating = ratingMap[analysisBlocks[i].EndTimeFraction]
		}
	}

	result := videoanalysisData{
		Video:    videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusCreated, result)
}
