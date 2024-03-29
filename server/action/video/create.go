package video

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"reflect"
	"time"

	"github.com/factly/vidcheck/action/author"
	"github.com/factly/vidcheck/config"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"

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
// @Param Video Api Data body videoReqData true "Video Api Data"
// @Success 201 {object} videoResData
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

	oID, err := util.GetOrganisation(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
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
	var status string = "draft"

	if videoData.Video.Status == "publish" {

		if len(videoData.Video.AuthorIDs) == 0 {
			errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot publish vid check without author", http.StatusUnprocessableEntity)))
			return
		}

		stat, err := getPublishPermissions(oID, sID, uID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
			return
		}

		if stat == http.StatusOK {
			status = "publish"
		}
	}

	if videoData.Video.Status == "ready" {
		status = "ready"
	}

	var path string

	path = fmt.Sprintf("/oembed?url=%s&omit_script=1", videoData.Video.URL)

	res, err := http.Get(viper.GetString("iframely_url") + path)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var iframelyres iFramelyRes
	err = json.NewDecoder(res.Body).Decode(&iframelyres)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	result := videoResData{}
	result.Video.Authors = make([]model.Author, 0)

	tx := model.DB.WithContext(context.WithValue(r.Context(), userContext, uID)).Begin()
	videoObj := model.Video{}
	videoObj.Tags = make([]model.Tag, 0)
	videoObj.Categories = make([]model.Category, 0)
	videoObj = model.Video{
		URL:           videoData.Video.URL,
		Title:         videoData.Video.Title,
		Slug:          videoData.Video.Slug,
		Summary:       videoData.Video.Summary,
		VideoType:     videoData.Video.VideoType,
		TotalDuration: videoData.Video.TotalDuration,
		Status:        status,
		SpaceID:       uint(sID),
		ThumbnailURL:  iframelyres.ThumbnailURL,
	}

	if status == "publish" {
		if videoData.Video.PublishedDate == nil {
			currTime := time.Now()
			result.Video.PublishedDate = &currTime
		} else {
			result.Video.PublishedDate = videoData.Video.PublishedDate
		}
	} else {
		result.Video.PublishedDate = nil
	}

	if len(videoData.Video.TagIDs) > 0 {
		model.DB.Model(&model.Tag{}).Where(videoData.Video.TagIDs).Find(&videoObj.Tags)
	}
	if len(videoData.Video.CategoryIDs) > 0 {
		model.DB.Model(&model.Category{}).Where(videoData.Video.CategoryIDs).Find(&videoObj.Categories)
	}

	err = tx.Preload("Tags").Preload("Categories").Create(&videoObj).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	result.Video.Video = videoObj

	// Adding author
	authors, err := author.All(r.Context())

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	for _, id := range videoData.Video.AuthorIDs {
		aID := fmt.Sprint(id)
		if _, found := authors[aID]; found && id != 0 {
			author := model.VideoAuthor{
				AuthorID: id,
				VideoID:  videoObj.ID,
			}
			err := tx.Model(&model.VideoAuthor{}).Create(&author).Error
			if err == nil {
				result.Video.Authors = append(result.Video.Authors, authors[aID])
			}
		}
	}

	claimBlocks := make([]model.Claim, 0)

	claimByte, err := util.ClaimSource(videoData.Video.URL, videoData.Video.Title)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.GetMessage("cannot parse claim sources", http.StatusUnprocessableEntity)))
		return
	}

	claimSources := postgres.Jsonb{}
	claimSources.RawMessage = claimByte

	for _, claimBlock := range videoData.Claims {
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

		claimBlockObj := &model.Claim{
			VideoID:         &videoObj.ID,
			RatingID:        claimBlock.RatingID,
			Claim:           claimBlock.Claim,
			ClaimDate:       claimBlock.ClaimDate,
			CheckedDate:     claimBlock.CheckedDate,
			Fact:            claimBlock.Fact,
			Description:     claimBlock.Description,
			ClaimantID:      claimBlock.ClaimantID,
			ReviewSources:   claimBlock.ReviewSources,
			ClaimSources:    claimSources,
			StartTime:       claimBlock.StartTime,
			EndTime:         claimBlock.EndTime,
			HTMLDescription: description,
			SpaceID:         uint(sID),
		}

		claimBlocks = append(claimBlocks, *claimBlockObj)
	}

	err = insertVideoIntoMeili(videoObj, videoData.Video.TagIDs, videoData.Video.CategoryIDs)
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	err = tx.Preload("Rating").Preload("Claimant").Create(&claimBlocks).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	for _, claim := range claimBlocks {
		var claimMeiliDate int64 = 0
		if claim.ClaimDate != nil {
			claimMeiliDate = claim.ClaimDate.Unix()
		}
		var checkedMeiliDate int64 = 0
		if claim.CheckedDate != nil {
			checkedMeiliDate = claim.CheckedDate.Unix()
		}
		err = insertClaimIntoMeili(claim, claimMeiliDate, checkedMeiliDate)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

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

	result.Claims = claimBlocks

	renderx.JSON(w, http.StatusCreated, result)
}

func insertVideoIntoMeili(video model.Video, tagIds []uint, categoryIds []uint) error {
	meiliObj := map[string]interface{}{
		"id":             video.ID,
		"kind":           "video",
		"title":          video.Title,
		"slug":           video.Slug,
		"url":            video.URL,
		"summary":        video.Summary,
		"video_type":     video.VideoType,
		"status":         video.Status,
		"total_duration": video.TotalDuration,
		"space_id":       video.SpaceID,
		"tag_ids":        tagIds,
		"category_ids":   categoryIds,
	}

	return meilisearchx.AddDocument(config.AppName, meiliObj)
}

func insertClaimIntoMeili(claim model.Claim, claimMeiliDate int64, checkedMeiliDate int64) error {
	meiliObj := map[string]interface{}{
		"id":             claim.ID,
		"kind":           "claims",
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

	return meilisearchx.AddDocument(config.AppName, meiliObj)
}

func getPublishPermissions(oID, sID, uID int) (int, error) {

	commonString := fmt.Sprint(":org:", oID, ":app:", config.AppName, ":space:", sID, ":")

	kresource := fmt.Sprint("resources", commonString, "fact-checks")
	kaction := fmt.Sprint("actions", commonString, "fact-checks:publish")

	result := util.KetoAllowed{}

	result.Action = kaction
	result.Resource = kresource
	result.Subject = fmt.Sprint(uID)

	resStatus, err := util.IsAllowed(result)
	if err != nil {
		return 0, err
	}

	return resStatus, nil
}

func getRatingAndClaimantIDs(claims []model.Claim) ([]uint, []uint) {

	ratingIDs := make([]uint, 0)
	claimantIDs := make([]uint, 0)

	rMap := make(map[uint]uint)
	cMap := make(map[uint]uint)

	for _, each := range claims {
		rMap[each.RatingID] = each.RatingID
		cMap[each.ClaimantID] = each.ClaimantID
	}

	for _, rid := range rMap {
		ratingIDs = append(ratingIDs, rid)
	}
	for _, cid := range cMap {
		claimantIDs = append(claimantIDs, cid)
	}

	return ratingIDs, claimantIDs
}
