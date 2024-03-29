package video

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"strconv"
	"time"

	"github.com/factly/vidcheck/action/author"
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/vidcheck/util/arrays"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
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

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
	result := videoResData{}
	result.Video.Authors = make([]model.Author, 0)

	videoAuthors := []model.VideoAuthor{}

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

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

	var videoStatus string = videoObj.Status
	var publishDate time.Time

	// Check if video status is changed back to draft from published
	if videoObj.Status == "publish" && videoData.Video.Status == "draft" {
		status, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}
		if status == http.StatusOK {
			videoStatus = "draft"
			tx.Model(&videoObj).Select("PublishedDate").Omit("Tags", "Categories").Updates(model.Video{PublishedDate: nil})
		} else {
			tx.Rollback()
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

	} else if videoData.Video.Status == "publish" {
		// Check if authors are not added while publishing video
		if len(videoData.Video.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish vid check without author", http.StatusUnprocessableEntity)))
			return
		}

		status, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}
		if status == http.StatusOK {
			videoStatus = "publish"
			if videoObj.PublishedDate == nil {
				currTime := time.Now()
				publishDate = currTime
			} else {
				publishDate = *videoObj.PublishedDate
			}
			tx.Model(&videoObj).Select("PublishedDate").Omit("Tags", "Categories").Updates(model.Video{PublishedDate: &publishDate})
		} else {
			tx.Rollback()
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
	} else if videoData.Video.Status == "ready" {
		videoStatus = "ready"
	} else if videoObj.Status == "ready" && videoData.Video.Status == "draft" {
		videoStatus = "draft"
	}

	tx.Model(&videoObj).Updates(model.Video{
		Base:      model.Base{UpdatedByID: uint(uID)},
		Title:     videoData.Video.Title,
		Summary:   videoData.Video.Summary,
		VideoType: videoData.Video.VideoType,
		Slug:      videoData.Video.Slug,
		Status:    videoStatus,
	}).Preload("Tags").Preload("Categories").First(&videoObj)

	result.Video.Video = *videoObj

	// fetch existing video authors
	model.DB.Model(&model.VideoAuthor{}).Where(&model.VideoAuthor{
		VideoID: uint(id),
	}).Find(&videoAuthors)

	prevAuthorIDs := make([]uint, 0)
	mapperVideoAuthor := map[uint]model.VideoAuthor{}
	videoAuthorIDs := make([]uint, 0)

	for _, videoAuthor := range videoAuthors {
		mapperVideoAuthor[videoAuthor.AuthorID] = videoAuthor
		prevAuthorIDs = append(prevAuthorIDs, videoAuthor.AuthorID)
	}

	toCreateIDs, toDeleteIDs := arrays.Difference(prevAuthorIDs, videoData.Video.AuthorIDs)

	// map video author ids
	for _, id := range toDeleteIDs {
		videoAuthorIDs = append(videoAuthorIDs, mapperVideoAuthor[id].ID)
	}

	// delete video authors
	if len(videoAuthorIDs) > 0 {
		err = tx.Where(&videoAuthorIDs).Delete(&model.VideoAuthor{}).Error
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.DBError()))
			return
		}
	}

	// creating new video authors
	for _, id := range toCreateIDs {
		if id != 0 {
			videoAuthor := &model.VideoAuthor{}
			videoAuthor.AuthorID = uint(id)
			videoAuthor.VideoID = result.Video.ID

			err = tx.Model(&model.VideoAuthor{}).Create(&videoAuthor).Error

			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.DBError()))
				return
			}
		}
	}

	// fetch existing video authors
	updatedVideoAuthors := []model.VideoAuthor{}
	tx.Model(&model.VideoAuthor{}).Where(&model.VideoAuthor{
		VideoID: uint(id),
	}).Find(&updatedVideoAuthors)

	// appending previous video authors to result
	for _, videoAuthor := range updatedVideoAuthors {
		aID := fmt.Sprint(videoAuthor.AuthorID)

		if author, found := authors[aID]; found {
			result.Video.Authors = append(result.Video.Authors, author)
		}
	}

	// Update into meili index
	var meiliPublishDate int64
	if videoObj.Status == "publish" {
		meiliPublishDate = videoObj.PublishedDate.Unix()
	}

	var updatedOrCreatedVideoBlock []uint

	meiliVideoObj := map[string]interface{}{
		"id":                 videoObj.ID,
		"kind":               "video",
		"title":              videoObj.Title,
		"slug":               videoObj.Slug,
		"url":                videoObj.URL,
		"summary":            videoObj.Summary,
		"video_type":         videoObj.VideoType,
		"status":             videoObj.Status,
		"total_duration":     videoObj.TotalDuration,
		"published_duration": meiliPublishDate,
		"space_id":           videoObj.SpaceID,
		"tag_ids":            videoData.Video.TagIDs,
		"category_ids":       videoData.Video.CategoryIDs,
		"author_ids":         videoData.Video.AuthorIDs,
	}

	err = meilisearchx.UpdateDocument(config.AppName, meiliVideoObj)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	claimByte, err := util.ClaimSource(videoData.Video.URL, videoData.Video.Title)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claim sources", http.StatusUnprocessableEntity)))
		return
	}

	claimSources := postgres.Jsonb{}
	claimSources.RawMessage = claimByte

	for _, claimBlock := range videoData.Claims {
		if claimBlock.ID != uint(0) {

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
				ClaimSources:    claimSources,
				StartTime:       claimBlock.StartTime,
				EndTime:         claimBlock.EndTime,
				HTMLDescription: description,
				SpaceID:         uint(sID),
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
				VideoID:         &videoObj.ID,
				RatingID:        claimBlock.RatingID,
				ClaimantID:      claimBlock.ClaimantID,
				Claim:           claimBlock.Claim,
				Fact:            claimBlock.Fact,
				Description:     claimBlock.Description,
				ReviewSources:   claimBlock.ReviewSources,
				ClaimSources:    claimSources,
				StartTime:       claimBlock.StartTime,
				EndTime:         claimBlock.EndTime,
				HTMLDescription: description,
				SpaceID:         uint(sID),
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
		claims := []model.Claim{}
		tx.Model(&model.Claim{}).Not(updatedOrCreatedVideoBlock).Where("video_id = ?", uint(id)).Delete(&claims)

		for _, claim := range claims {
			err = meilisearchx.DeleteDocument(config.AppName, claim.ID, "claim")
			if err != nil {
				tx.Rollback()
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}
		}
	}

	claimBlocks := make([]model.Claim, 0)

	model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", uint(id)).Preload("Rating").Preload("Claimant").Find(&claimBlocks)

	result.Claims = claimBlocks

	space := model.Space{}
	space.ID = uint(sID)

	tx.First(&space)

	schemas := util.GetFactCheckSchema(claimBlocks, result.Video.CreatedAt, result.Video.Slug, space)

	byteArr, err := json.Marshal(schemas)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	video := &result.Video.Video
	tx.Model(&video).Select("Schemas").Updates(&model.Video{
		Schemas: postgres.Jsonb{RawMessage: byteArr},
	})

	result.Video.Schemas = postgres.Jsonb{RawMessage: byteArr}

	tx.Commit()

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

	return meilisearchx.UpdateDocument(config.AppName, meiliObj)
}
