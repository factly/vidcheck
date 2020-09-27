package video

import (
	"net/http"

	"github.com/factly/vidcheck/server/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int              `json:"total"`
	Nodes []model.Video    `json:"nodes"`
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
	result := paging{}
	result.Nodes = make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())
	model.DB.Model(&model.Video{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)
	renderx.JSON(w, http.StatusOK, result)
}


// create - Create video
// @Summary Create video
// @Description Create video
// @Tags Product
// @ID add-video
// @Consume json
// @Produce  json
// @Param Product body video true "Product object"
// @Success 201 {object} model.Product
// @Failure 400 {array} string
// @Router /videos [post]
func create(w http.ResponseWriter, r *http.Request) {

	video := &video{}
	err := json.NewDecoder(r.Body).Decode(&video)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(product)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := model.Video{}
	result = model.Video{
		Url:               product.Url,
		Title:             product.Title,
		TotalTime:         product.TotalTime,
		Description:       product.Description,
		VideoType:         product.VideoType,
	}

	tx := model.DB.Begin()
	err = tx.Model(&model.Video{}).Create(&result).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}
	tx.Commit()
	renderx.JSON(w, http.StatusCreated, result)
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

	result := &model.Video{}
	result.ID = uint(id)

	err = model.DB.Model(&model.Video{}).First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}
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
	videoId := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoId)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	video := &video{}

	err = json.NewDecoder(r.Body).Decode(&video)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DecodeError()))
		return
	}

	validationError := validationx.Check(video)
	if validationError != nil {
		loggerx.Error(errors.New("validation error"))
		errorx.Render(w, validationError)
		return
	}

	result := &model.Video{}
	result.ID = uint(id)

	err = model.DB.First(&result).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Model(&result).Updates(model.Video{
		Url:            video.Status,
		Title:          video.Title,
		TotalTime:      video.TotalTime,
		Description:    video.Description,
		VideoType:      video.VideoType,
	}).First(&result)

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
