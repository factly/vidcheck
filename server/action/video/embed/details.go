package embed

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/editorx"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get published video by id
// @Summary Show a published video by id
// @Description Get published video by ID
// @Tags Videos
// @ID get-published-video-by-id
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param video_id path string true "Video ID"
// @Success 200 {object} videoanalysisData
// @Failure 400 {array} string
// @Router /videos/embed/{video_id} [get]
func publishedDetails(w http.ResponseWriter, r *http.Request) {

	videoID := chi.URLParam(r, "video_id")
	id, err := strconv.Atoi(videoID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	videoObj := &model.Video{}
	videoObj.ID = uint(id)
	analysisBlocks := make([]model.Analysis, 0)
	err = model.DB.Model(&model.Video{}).Where(&model.Video{
		Status: "published",
	}).First(&videoObj).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	model.DB.Model(&model.Analysis{}).Preload("Rating").Order("start_time").Where("video_id = ?", uint(id)).Find(&analysisBlocks)

	for index, each := range analysisBlocks {

		arrByte, err := each.Description.MarshalJSON()

		desc := make(map[string]interface{})
		err = json.Unmarshal(arrByte, &desc)

		if err == nil {
			html, _ := editorx.EditorjsToHTML(desc)
			analysisBlocks[index].HTMLDescription = html
		}

		claimArrByte, err := each.Fact.MarshalJSON()

		fact := make(map[string]interface{})
		err = json.Unmarshal(claimArrByte, &fact)

		if err == nil {
			html, _ := editorx.EditorjsToHTML(fact)
			analysisBlocks[index].HTMLFact = html
		}

	}

	result := videoanalysisData{
		Video:    *videoObj,
		Analysis: analysisBlocks,
	}
	renderx.JSON(w, http.StatusOK, result)
}
