package video

import (
	"fmt"
	"net/http"

	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/meilisearchx"
	"github.com/factly/x/middlewarex"
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
// @Router /videos [get]
func list(w http.ResponseWriter, r *http.Request) {
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

	result := paging{}
	result.Nodes = make([]videoResData, 0)

	videos := make([]model.Video, 0)
	offset, limit := paginationx.Parse(r.URL.Query())

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")

	filteredVideoIDs := make([]uint, 0)

	if searchQuery != "" {

		filters := fmt.Sprint("space_id=", sID)
		var hits []interface{}

		hits, err = meilisearchx.SearchWithQuery("vidcheck", searchQuery, filters, "video")

		if err != nil {
			loggerx.Error(err)
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		filteredVideoIDs = meilisearchx.GetIDArray(hits)
		if len(filteredVideoIDs) == 0 {
			renderx.JSON(w, http.StatusOK, result)
			return
		}
	}

	if sort != "asc" {
		sort = "desc"
	}

	tx := model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
	}).Preload("Tags").Preload("Categories").Order("created_at " + sort)

	if len(filteredVideoIDs) > 0 {
		err = tx.Where(filteredVideoIDs).Count(&result.Total).Offset(offset).Limit(limit).Find(&videos).Error
	} else {
		err = tx.Count(&result.Total).Offset(offset).Limit(limit).Find(&videos).Error
	}

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
		var claimData videoResData
		claimData.Video = video
		stmt := model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", video.ID).Preload("Claimant")

		if !config.DegaIntegrated() {
			stmt.Preload("Rating")
		}

		stmt.Find(&claimData.Claims)

		if config.DegaIntegrated() {
			claimData.Claims = AddDegaRatings(uID, sID, claimData.Claims, ratingMap)
		}

		result.Nodes = append(result.Nodes, claimData)
	}

	renderx.JSON(w, http.StatusOK, result)
}
