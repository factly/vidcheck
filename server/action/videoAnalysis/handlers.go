package videoAnalysis

import (
	"net/http"
	"encoding/json"
	"errors"
	"strconv"

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
	Total int                       `json:"total"`
	Nodes []model.VideoAnalysis     `json:"nodes"`
}

// list - Get all videosAnalysis
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
	result := paging{}
	result.Nodes = make([]model.VideoAnalysis, 0)
	offset, limit := paginationx.Parse(r.URL.Query())
	model.DB.Model(&model.VideoAnalysis{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)
	renderx.JSON(w, http.StatusOK, result)
}


// create - Create videoAnalysis
// @Summary Create videoAnalysis
// @Description Create videoAnalysis
// @ID add-videoAnalysis
// @Param Product body product true "Product object"
// @Success 201 {object} model.videoAnalysis
// @Failure 400 {array} string
// @Router /video/{}/videoanalysis [post]
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
    tx.Model(&model.Video{}).Create(&videoObj)
	analysisBlocks := []model.VideoAnalysis{}

	for _, analysisBlock := range videoAnalysisData.Analysis {
        analysisBlockObj := model.VideoAnalysis{}
        analysisBlockObj = model.VideoAnalysis{
            VideoID         : videoObj.ID,
            RatingValue     : analysisBlock.RatingValue,
            Claim           : analysisBlock.Claim,
            Fact            : analysisBlock.Fact,
            StartTime       : analysisBlock.StartTime,
            EndTime         : analysisBlock.EndTime,
            EntTimeFraction : analysisBlock.EntTimeFraction,
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

//     type result struct {
//         Video       model.Video
//         Analysis    []interface{}
//     }
//     res := result{videoObj, analysisBlocks}
	renderx.JSON(w, http.StatusCreated, videoObj)
}

// details - Get video_analysis by id
// @Summary Show a video_analysis by id
// @Description Get video_analysis by ID
// @ID get-video_analysis by-id
// @Produce  json
// @Param video_analysis id path string true "Video ID"
// @Success 200 {object} model.Catalog
// @Failure 400 {array} string
// @Router /video_analysis /{video_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.VideoAnalysis{}
	result.ID = uint(id)

	err = model.DB.Model(&model.VideoAnalysis{}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
	renderx.JSON(w, http.StatusOK, result)
}


// update - Update video_analysis by id
// @Summary Update a video_analysis by id
// @Description Update video_analysis by ID
// @ID update-video_analysis-by-id
// @Produce json
// @Consume json
// @Param video_analysis_id path string true "Currency ID"
// @Param Currency body currency false "Currency"
// @Success 200 {object} model.Currency
// @Failure 400 {array} string
// @Router /currencies/{video_analysis_id} [put]
func update(w http.ResponseWriter, r *http.Request) {
	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	videoAnalysis := &videoAnalysis{}

	err = json.NewDecoder(r.Body).Decode(&videoAnalysis)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(videoAnalysis)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.VideoAnalysis{}
	result.ID = uint(id)

	err = model.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Model(&result).Updates(model.VideoAnalysis{
		RatingValue     : videoAnalysis.RatingValue,
        Claim           : videoAnalysis.Claim,
        Fact            : videoAnalysis.Fact,
        StartTime       : videoAnalysis.StartTime,
        EndTime         : videoAnalysis.EndTime,
        EntTimeFraction : videoAnalysis.EntTimeFraction,
	}).First(&result)

	renderx.JSON(w, http.StatusOK, result)
}

// delete - Delete cart by id
// @Summary Delete a cart
// @Description Delete cart by ID
// @Tags Cart
// @ID delete-cart-by-id
// @Consume  json
// @Param X-User header string true "User ID"
// @Param cartitem_id path string true "Cart Item ID"
// @Success 200
// @Failure 400 {array} string
// @Router /cartitems/{cartitem_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	videoAnalysisId := chi.URLParam(r, "video_analysis_id")
	id, err := strconv.Atoi(videoAnalysisId)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.VideoAnalysis{}
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
