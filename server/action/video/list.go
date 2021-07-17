package video

import (
	"fmt"
	"net/http"
	"net/url"

	"github.com/factly/vidcheck/action/author"
	"github.com/factly/vidcheck/action/claimant"
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

	// Filters
	u, _ := url.Parse(r.URL.String())
	queryMap := u.Query()

	searchQuery := r.URL.Query().Get("q")
	sort := r.URL.Query().Get("sort")
	filters := generateFilters(queryMap["tag"], queryMap["category"], queryMap["author"], queryMap["status"], queryMap["rating"], queryMap["claimant"])

	filteredVideoIDs := make([]uint, 0)

	if filters != "" {
		filters = fmt.Sprint(filters, " AND space_id=", sID)
	}

	if filters != "" || searchQuery != "" {

		var hits []interface{}
		var res map[string]interface{}

		if searchQuery != "" {
			hits, err = meilisearchx.SearchWithQuery("vidcheck", searchQuery, filters, "video")
		} else {
			res, err = meilisearchx.SearchWithoutQuery("vidcheck", filters, "video")
			if _, found := res["hits"]; found {
				hits = res["hits"].([]interface{})
			}
		}

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
	var claimantMap map[uint]model.Claimant

	var videoIDs []uint
	for _, p := range videos {
		videoIDs = append(videoIDs, p.ID)
	}

	// fetch all authors
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	// fetch all authors related to videos
	videoAuthors := []model.VideoAuthor{}
	model.DB.Model(&model.VideoAuthor{}).Where("video_id in (?)", videoIDs).Find(&videoAuthors)

	videoAuthorMap := make(map[uint][]uint)
	for _, videoAuthor := range videoAuthors {
		if _, found := videoAuthorMap[videoAuthor.VideoID]; !found {
			videoAuthorMap[videoAuthor.VideoID] = make([]uint, 0)
		}
		videoAuthorMap[videoAuthor.VideoID] = append(videoAuthorMap[videoAuthor.VideoID], videoAuthor.AuthorID)
	}
	claimsList := make([]model.Claim, 0)

	videoClaimList := make(map[uint][]model.Claim, 0)

	for _, video := range videos {
		var claimData videoResData
		claimData.Video.Video = video
		claimData.Video.Authors = make([]model.Author, 0)

		videoAuthors, hasEle := videoAuthorMap[video.ID]

		claims := make([]model.Claim, 0)

		if hasEle {
			for _, videoAuthor := range videoAuthors {
				aID := fmt.Sprint(videoAuthor)
				if author, found := authors[aID]; found {
					claimData.Video.Authors = append(claimData.Video.Authors, author)
				}
			}
		}
		model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", video.ID).Find(&claims)

		claimsList = append(claimsList, claims...)

		videoClaimList[video.ID] = claims

		if config.DegaIntegrated() {
			claimData.Claims = AddEntities(uID, sID, claimsList, ratingMap, claimantMap)
		}

		result.Nodes = append(result.Nodes, claimData)
	}

	ratingIDs, claimantIDs := getRatingAndClaimantIDs(claimsList)

	if config.DegaIntegrated() {
		ratingMap, err = rating.GetDegaRatings(uID, sID, ratingIDs)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		claimantMap, err = claimant.GetDegaClaimants(uID, sID, claimantIDs)
		if err != nil {
			tx.Rollback()
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
	} else {

		ratings := make([]model.Rating, 0)
		claimants := make([]model.Claimant, 0)

		model.DB.Model(model.Rating{}).Where(ratingIDs).Find(&ratings)

		model.DB.Model(model.Claimant{}).Where(claimantIDs).Find(&claimants)

		for _, rating := range ratings {
			ratingMap[rating.ID] = rating
		}
		for _, claimant := range claimants {
			claimantMap[claimant.ID] = claimant
		}
	}

	for index, video := range result.Nodes {
		videoData := video
		if config.DegaIntegrated() {
			videoData.Claims = AddEntities(uID, sID, videoClaimList[video.Video.ID], ratingMap, claimantMap)
		}
		result.Nodes[index] = videoData
	}

	renderx.JSON(w, http.StatusOK, result)
}

func generateFilters(tagIDs, categoryIDs, authorIDs, status, ratingIDs, claimantIDs []string) string {
	filters := ""
	if len(tagIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(tagIDs, "tag_ids"), " AND ")
	}

	if len(categoryIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(categoryIDs, "category_ids"), " AND ")
	}

	if len(authorIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(authorIDs, "author_ids"), " AND ")
	}

	if len(status) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(status, "status"), " AND ")
	}

	if len(ratingIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(ratingIDs, "rating_id"), " AND ")
	}
	if len(claimantIDs) > 0 {
		filters = fmt.Sprint(filters, meilisearchx.GenerateFieldFilter(claimantIDs, "claimant_id"), " AND ")
	}

	if filters != "" && filters[len(filters)-5:] == " AND " {
		filters = filters[:len(filters)-5]
	}

	return filters
}
