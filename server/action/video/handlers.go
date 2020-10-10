package video

import (
	"net/http"
	"encoding/json"
	"errors"
	"strconv"
	"fmt"

    "github.com/go-chi/chi"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/validationx"
)

// list response
type paging struct {
	Total int              `json:"total"`
    Videos []model.Video    `json:"videos"`
}

// create - Create video
// @Summary Create video
// @Description Create video
// @ID add-video
// @Param Product body product true "Product object"
// @Success 201 {object} model.video
// @Failure 400 {array} string
// @Router /video [post]
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
	    Url:           videoAnalysisData.Video.Url,
		Title:         videoAnalysisData.Video.Title,
		Summary:       videoAnalysisData.Video.Summary,
		VideoType:     videoAnalysisData.Video.VideoType,
	}
    tx.Create(&videoObj)
	analysisBlocks := []model.VideoAnalysis{}

	for _, analysisBlock := range videoAnalysisData.Analysis {
        analysisBlockObj := model.VideoAnalysis{}
        analysisBlockObj = model.VideoAnalysis{
            VideoID         : videoObj.ID,
            Video           : videoObj,
            RatingValue     : analysisBlock.RatingValue,
            Claim           : analysisBlock.Claim,
            Fact            : analysisBlock.Fact,
            StartTime       : analysisBlock.StartTime,
            EndTime         : analysisBlock.EndTime,
            EndTimeFraction : analysisBlock.EndTimeFraction,
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


// list - Get all videos
// @Summary Show all videos
// @Description Get all videos
// @Tags Videos
// @ID get-all-videos
// @Produce  json
// @Param limit query string false "limt per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /videos [get]
func list(w http.ResponseWriter, r *http.Request) {
    fmt.Println("in the end...")
	result := paging{}
	result.Videos = make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())
	model.DB.Model(&model.Video{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Videos)
	renderx.JSON(w, http.StatusOK, result)
}


// details - Get video by id
// @Summary Show a video by id
// @Description Get video by ID
// @ID get-video by-id
// @Produce  json
// @Param video id path string true "Video ID"
// @Success 200 {object} model.Catalog
// @Failure 400 {array} string
// @Router /video /{video_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	videoObj := &model.Video{}
	videoObj.ID = uint(id)
    analysisBlocks := []model.VideoAnalysis{}
	err = model.DB.Model(&model.Video{}).First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	err = model.DB.Model(&model.VideoAnalysis{}).Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks).Error
    if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

    result := map[string]interface{}{"video": videoObj, "analysis": analysisBlocks}
	renderx.JSON(w, http.StatusOK, result)
}

// update - Update video by id
// @Summary Update a video by id
// @Description Update video by ID
// @ID update-video-by-id
// @Produce json
// @Consume json
// @Param video_id path string true "Video ID"
// @Param Video body Video false "Video"
// @Success 200 {object} model.Currency
// @Failure 400 {array} string
// @Router /videos/{video_id} [put]
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
		Title:          videoAnalysisData.Video.Title,
		Summary:        videoAnalysisData.Video.Summary,
		VideoType:      videoAnalysisData.Video.VideoType,
	}).First(&videoObj)

	for _, analysisBlock := range videoAnalysisData.Analysis {
	    if (analysisBlock.id != uint(0)) {
	        analysisBlockObj := &model.VideoAnalysis{}
	        analysisBlockObj.ID = uint(analysisBlock.id)
            tx.Model(&analysisBlockObj).Updates(model.VideoAnalysis{
                RatingValue     : analysisBlock.RatingValue,
                Claim           : analysisBlock.Claim,
                Fact            : analysisBlock.Fact,
                StartTime       : analysisBlock.StartTime,
                EndTime         : analysisBlock.EndTime,
                EndTimeFraction : analysisBlock.EndTimeFraction,
            }).First(&analysisBlockObj)
	    } else {
            analysisBlockObj := model.VideoAnalysis{}
            analysisBlockObj = model.VideoAnalysis{
                VideoID         : videoObj.ID,
                Video           : *videoObj,
                RatingValue     : analysisBlock.RatingValue,
                Claim           : analysisBlock.Claim,
                Fact            : analysisBlock.Fact,
                StartTime       : analysisBlock.StartTime,
                EndTime         : analysisBlock.EndTime,
                EndTimeFraction : analysisBlock.EndTimeFraction,
            }
            err = tx.Model(&model.VideoAnalysis{}).Create(&analysisBlockObj).Error
            if err != nil {
                tx.Rollback()
                loggerx.Error(err)
                errorx.Render(w, errorx.Parser(errorx.DBError()))
                return
            }
        }

    }
    tx.Commit()

    // Get all video analysisBlocks.
    analysisBlocks := []model.VideoAnalysis{}
    model.DB.Model(&model.VideoAnalysis{}).Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks)
    result := map[string]interface{}{"video": videoObj, "analysis": analysisBlocks}
	renderx.JSON(w, http.StatusOK, result)
}

// delete - Delete video by id
// @Summary Delete a video
// @Description Delete video by ID
// @Tags Cart
// @ID delete-video-by-id
// @Consume  json
// @Param video_id path string true "Video ID"
// @Success 200
// @Failure 400 {array} string
// @Router /video/{video_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Video{}
	result.ID = uint(id)

	// check record exists or not
	err = model.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	tx := model.DB.Begin()
	err = tx.Delete(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, nil)
}
