package embed

import (
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Rating `json:"nodes"`
}

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Ratings
// @ID get-all-ratings
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limt per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /ratings/embed [get]
func list(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Rating, 0)

	model.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sID),
	}).Count(&result.Total).Find(&result.Nodes)

	renderx.JSON(w, http.StatusOK, result)
}
