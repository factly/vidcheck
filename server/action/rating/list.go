package rating

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/paginationx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

// list response
type paging struct {
	Total int64          `json:"total"`
	Nodes []model.Rating `json:"nodes"`
}

// list - Get all ratings
// @Summary Show all ratings
// @Description Get all ratings
// @Tags Rating
// @ID get-all-ratings
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param limit query string false "limit per page"
// @Param page query string false "page number"
// @Success 200 {object} paging
// @Router /ratings [get]
func list(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	result := paging{}
	result.Nodes = make([]model.Rating, 0)

	offset, limit := paginationx.Parse(r.URL.Query())

	err = model.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sID),
	}).Count(&result.Total).Order("id desc").Offset(offset).Limit(limit).Find(&result.Nodes).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}

//GetDegaRatings fetches all the ratings from dega-server
func GetDegaRatings(uID, sID int) (map[uint]model.Rating, error) {
	url := fmt.Sprint(viper.GetString("dega.url"), "/fact-check/ratings?all=true")
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User", fmt.Sprint(uID))
	req.Header.Set("X-Space", fmt.Sprint(sID))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()

	var pagingRes paging
	err = json.NewDecoder(resp.Body).Decode(&pagingRes)
	if err != nil {
		return nil, err
	}

	if pagingRes.Total == 0 {
		return nil, errors.New(`empty ratings response`)
	}
	ratmap := make(map[uint]model.Rating)
	for _, rating := range pagingRes.Nodes {
		ratmap[rating.ID] = rating
	}
	return ratmap, nil
}
