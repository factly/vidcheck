package video

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/config"

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
// @Success 200 {object} videoanalysisData
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

	videoObj := &model.Video{}
	videoObj.ID = uint(id)
	analysisBlocks := []model.Analysis{}

	err = model.DB.Model(&model.Video{}).Where(&model.Video{
		SpaceID: uint(sID),
	}).First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	stmt := model.DB.Model(&model.Analysis{}).Order("start_time").Where("video_id = ?", uint(id)).Preload("Claimant")

	if !config.DegaIntegrated() {
		stmt.Preload("Rating")
	}

	stmt.Find(&analysisBlocks)

	if config.DegaIntegrated() {
		ratingMap, err := rating.GetDegaRatings(uID, sID)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}

		analysisBlocks = AddDegaRatings(uID, sID, analysisBlocks, ratingMap)
	}

	for index, each := range analysisBlocks {

		arrByte, err := each.Description.MarshalJSON()

		desc := make(map[string]interface{})
		err = json.Unmarshal(arrByte, &desc)

		if err == nil {
			html, _ := editorx.EditorjsToHTML(desc)
			analysisBlocks[index].HTMLDescription = html
		}

	}

	result := videoanalysisData{
		Video:    *videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}

// AddDegaRatings added ratings from dega server in analysis list
func AddDegaRatings(uID, sID int, analysisList []model.Analysis, ratingMap map[uint]model.Rating) []model.Analysis {
	for i := range analysisList {
		if rat, found := ratingMap[analysisList[i].RatingID]; found {
			analysisList[i].Rating = &rat
		}
	}
	return analysisList
}
