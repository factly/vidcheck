package video

import (
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total  int           `json:"total"`
	Videos []model.Video `json:"videos"`
}

// list - Get all videos
// @Summary Show all videos
// @Description Get all videos
// @Tags Videos
// @ID get-all-videos
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param limit query string false "limt per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /api/v1/video [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Videos = make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())
	model.DB.Model(&model.Video{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Videos)
	renderx.JSON(w, http.StatusOK, result)
}
