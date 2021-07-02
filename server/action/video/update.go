package video

import (
	"encoding/json"
	"errors"
	"net/http"
	"reflect"
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
// @Param Video Analysis Api Data body videoReqData true "Video Analysis Api Data"
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

	videoData := &videoReqData{}
	err = json.NewDecoder(r.Body).Decode(&videoData)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(videoData)
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

	newTags := make([]model.Tag, 0)
	if len(videoData.Video.TagIDs) > 0 {
		model.DB.Model(&model.Tag{}).Where(videoData.Video.TagIDs).Find(&newTags)
		if err = tx.Model(&videoObj).Association("Tags").Replace(&newTags); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = model.DB.Model(&videoObj).Association("Tags").Clear()
	}

	newCategories := make([]model.Category, 0)
	if len(videoData.Video.CategoryIDs) > 0 {
		model.DB.Model(&model.Category{}).Where(videoData.Video.CategoryIDs).Find(&newCategories)
		if err = tx.Model(&videoObj).Association("Categories").Replace(&newCategories); err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	} else {
		_ = model.DB.Model(&videoObj).Association("Categories").Clear()
	}

	tx.Model(&videoObj).Updates(model.Video{
		Base:      model.Base{UpdatedByID: uint(uID)},
		Title:     videoData.Video.Title,
		Summary:   videoData.Video.Summary,
		VideoType: videoData.Video.VideoType,
		Status:    videoData.Video.Status,
	}).Preload("Tags").Preload("Categories").First(&videoObj)

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
		"tag_ids":        videoData.Video.TagIDs,
		"category_ids":   videoData.Video.CategoryIDs,
	}

	err = meilisearchx.UpdateDocument("vidcheck", meiliVideoObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var updatedOrCreatedVideoBlock []uint
	for _, claimBlock := range videoData.Claims {
		if claimBlock.ID != uint(0) {
			// check if new rating exist
			if config.DegaIntegrated() {
				if rat, found := degaRatingMap[claimBlock.RatingID]; found {
					ratingMap[claimBlock.EndTime] = &rat
				} else {
					err = errors.New(`rating does not exist in dega`)
				}
			} else {
				rat := model.Rating{}
				rat.ID = claimBlock.RatingID
				err = tx.First(&rat).Error
			}

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			claimBlockObj := &model.Claim{}
			claimBlockObj.ID = uint(claimBlock.ID)

			// Store HTML description
			var description string
			if len(claimBlock.Description.RawMessage) > 0 && !reflect.DeepEqual(claimBlock.Description, util.NilJsonb()) {
				description, err = util.HTMLDescription(claimBlock.Description)
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claimBlock description", http.StatusUnprocessableEntity)))
					return
				}
			}
			tx.Model(&claimBlockObj).Updates(model.Claim{
				Base:            model.Base{UpdatedByID: uint(uID)},
				RatingID:        claimBlock.RatingID,
				Claim:           claimBlock.Claim,
				ClaimDate:       claimBlock.ClaimDate,
				CheckedDate:     claimBlock.CheckedDate,
				Fact:            claimBlock.Fact,
				Description:     claimBlock.Description,
				ReviewSources:   claimBlock.ReviewSources,
				ClaimantID:      claimBlock.ClaimantID,
				ClaimSources:    claimBlock.ClaimSources,
				StartTime:       claimBlock.StartTime,
				EndTime:         claimBlock.EndTime,
				HTMLDescription: description,
			})

			err = updateAnalysisObjIntoMeili(*claimBlockObj)
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, claimBlockObj.ID)
		} else {
			// check if new rating exist
			if config.DegaIntegrated() {
				if rat, found := degaRatingMap[claimBlock.RatingID]; found {
					ratingMap[claimBlock.EndTime] = &rat
				} else {
					err = errors.New(`rating does not exist in dega`)
				}
			} else {
				rat := model.Rating{}
				rat.ID = claimBlock.RatingID
				err = tx.First(&rat).Error
			}

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			claimBlockObj := model.Claim{}

			// Store HTML description
			var description string
			if len(claimBlock.Description.RawMessage) > 0 && !reflect.DeepEqual(claimBlock.Description, util.NilJsonb()) {
				description, err = util.HTMLDescription(claimBlock.Description)
				if err != nil {
					loggerx.Error(err)
					errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claimBlock description", http.StatusUnprocessableEntity)))
					return
				}
			}
			claimBlockObj = model.Claim{
				VideoID:         videoObj.ID,
				RatingID:        claimBlock.RatingID,
				ClaimantID:      claimBlock.ClaimantID,
				Claim:           claimBlock.Claim,
				Fact:            claimBlock.Fact,
				Description:     claimBlock.Description,
				ReviewSources:   claimBlock.ReviewSources,
				StartTime:       claimBlock.StartTime,
				EndTime:         claimBlock.EndTime,
				HTMLDescription: description,
			}
			err = tx.Model(&model.Claim{}).Create(&claimBlockObj).Error
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}

			err = updateAnalysisObjIntoMeili(claimBlockObj)
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
			updatedOrCreatedVideoBlock = append(updatedOrCreatedVideoBlock, claimBlockObj.ID)
		}
	}
	// delete all the videoAnalysisBlocks which is neither updated/created.
	if len(updatedOrCreatedVideoBlock) > 0 {
		claimBlocks := []model.Claim{}
		tx.Model(&model.Claim{}).Not(updatedOrCreatedVideoBlock).Where("video_id = ?", uint(id)).Delete(&claimBlocks)

		for _, claim := range claimBlocks {
			err = meilisearchx.DeleteDocument("vidcheck", claim.ID, "claim")
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	tx.Commit()

	// Get all video claimBlocks.
	claimBlocks := []model.Claim{}
	stmt := model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", uint(id)).Preload("Claimant")

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&claimBlocks)

	if config.DegaIntegrated() {
		claimBlocks = AddDegaRatings(uID, sID, claimBlocks, degaRatingMap)
	}

	result := videoResData{
		Video:  *videoObj,
		Claims: claimBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}

func updateAnalysisObjIntoMeili(claim model.Claim) error {
	var claimMeiliDate int64 = 0
	if claim.ClaimDate != nil {
		claimMeiliDate = claim.ClaimDate.Unix()
	}
	var checkedMeiliDate int64 = 0
	if claim.CheckedDate != nil {
		checkedMeiliDate = claim.CheckedDate.Unix()
	}
	meiliObj := map[string]interface{}{
		"id":             claim.ID,
		"kind":           "claim",
		"video_id":       claim.VideoID,
		"rating_id":      claim.RatingID,
		"claim":          claim.Claim,
		"description":    claim.Description,
		"claim_date":     claimMeiliDate,
		"checked_date":   checkedMeiliDate,
		"fact":           claim.Fact,
		"claimant_id":    claim.ClaimantID,
		"review_sources": claim.ReviewSources,
		"end_time":       claim.EndTime,
		"start_time":     claim.StartTime,
		"space_id":       claim.SpaceID,
	}

	return meilisearchx.UpdateDocument("vidcheck", meiliObj)
}
