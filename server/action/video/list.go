package video

import (
	"net/http"

	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64               `json:"total"`
	Nodes []videoanalysisData `json:"nodes"`
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
// @Router /videos [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	result := paging{}
	result.Nodes = make([]videoanalysisData, 0)

	videos := make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())

	model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
	}).Count(&result.Total).Offset(offset).Limit(limit).Find(&videos)

	var ratingMap map[uint]model.Rating

	if config.DegaIntegrated() {
		ratingMap, err = rating.GetDegaRatings(uID, sID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	}

	for _, video := range videos {
		var analysisData videoanalysisData
		analysisData.Video = video
		stmt := model.DB.Model(&model.Analysis{}).Order("start_time").Where("video_id = ?", video.ID)

		if !config.DegaIntegrated() {
			stmt.Preload("Rating")
		}

		stmt.Find(&analysisData.Analysis)

		if config.DegaIntegrated() {
			analysisData.Analysis = AddDegaRatings(uID, sID, analysisData.Analysis, ratingMap)
		}

		result.Nodes = append(result.Nodes, analysisData)
	}

	renderx.JSON(w, http.StatusOK, result)
}
