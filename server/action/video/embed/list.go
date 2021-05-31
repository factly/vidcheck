package embed

import (
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []videoResData `json:"nodes"`
}

// list - Get all videos
// @Summary Show all videos
// @Description Get all videos
// @Tags Videos
// @ID get-all-videos
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limt per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /videos/embed [get]
func list(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := paging{}
	result.Nodes = make([]videoResData, 0)

	videos := make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())

	model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
		Status:  "published",
	}).Count(&result.Total).Offset(offset).Limit(limit).Find(&videos)

	for _, video := range videos {
		var analysisData videoResData
		analysisData.Video = video
		model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", video.ID).Preload("Claimant").Preload("Rating").Find(&analysisData.Claims)

		result.Nodes = append(result.Nodes, analysisData)
	}

	renderx.JSON(w, http.StatusOK, result)
}
