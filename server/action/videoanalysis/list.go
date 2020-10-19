package videoanalysis

import (
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64            `json:"total"`
	Nodes []model.Analysis `json:"nodes"`
}

// list - Get all videosAnalysis
// @Summary Show all video analysis
// @Description Show all video analysis
// @Tags VideoAnalysis
// @ID get-all-video-analysis
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Organisation header string true "Organisation ID"
// @Param limit query string false "limt per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /api/v1/analyse [get]
func list(w http.ResponseWriter, r *http.Request) {
	result := paging{}
	result.Nodes = make([]model.Analysis, 0)
	offset, limit := paginationx.Parse(r.URL.Query())
	model.DB.Model(&model.Analysis{}).Count(&result.Total).Offset(offset).Limit(limit).Find(&result.Nodes)
	renderx.JSON(w, http.StatusOK, result)
}
