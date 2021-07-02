package video

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/action/author"
	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/editorx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get video by id
// @Summary Show a video by id
// @Description Get video by ID
// @Tags Videos
// @ID get-video by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param video_id path string true "Video ID"
// @Success 200 {object} videoResData
// @Failure 400 {array} string
// @Router /videos/{video_id} [get]
func details(w http.ResponseWriter, r *http.Request) {
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

	videoID := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := videoResData{}

	videoObj := &model.Video{}
	videoObj.Tags = make([]model.Tag, 0)
	videoObj.Categories = make([]model.Category, 0)
	videoObj.ID = uint(id)
	claimBlocks := []model.Claim{}
	videoAuthors := []model.VideoAuthor{}

	err = model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
	}).Preload("Tags").Preload("Categories").First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	result.Video.Video = *videoObj

	// fetch all authors
	model.DB.Model(&model.VideoAuthor{}).Where(&model.VideoAuthor{
		VideoID: uint(id),
	}).Find(&videoAuthors)

	// Adding author
	authors, err := author.All(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}
	for _, videoAuthor := range videoAuthors {
		aID := fmt.Sprint(videoAuthor.AuthorID)
		if author, found := authors[aID]; found {
			result.Video.Authors = append(result.Video.Authors, author)
		}
	}

	stmt := model.DB.Model(&model.Claim{}).Order("start_time").Where("video_id = ?", uint(id)).Preload("Claimant")

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&claimBlocks)

	if config.DegaIntegrated() {
		ratingMap, err := rating.GetDegaRatings(uID, sID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		claimBlocks = AddDegaRatings(uID, sID, claimBlocks, ratingMap)
	}

	for index, each := range claimBlocks {

		arrByte, err := each.Description.MarshalJSON()

		desc := make(map[string]interface{})
		err = json.Unmarshal(arrByte, &desc)

		if err == nil {
			html, _ := editorx.EditorjsToHTML(desc)
			claimBlocks[index].HTMLDescription = html
		}

	}

	result.Claims = claimBlocks

	renderx.JSON(w, http.StatusOK, result)
}

// AddDegaRatings added ratings from dega server in claim list
func AddDegaRatings(uID, sID int, claimList []model.Claim, ratingMap map[uint]model.Rating) []model.Claim {
	for i := range claimList {
		if rat, found := ratingMap[claimList[i].RatingID]; found {
			claimList[i].Rating = &rat
		}
	}
	return claimList
}
