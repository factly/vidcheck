package rating

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
	"github.com/spf13/viper"
)

// details - Get rating by id
// @Summary Show a rating by id
// @Description Get rating by ID
// @Tags Rating
// @ID get-rating-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Success 200 {object} model.Rating
// @Router /ratings/{rating_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	result := &model.Rating{}

	result.ID = uint(id)

	err = model.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}

//ExistInDega checks if rating exist in dega server db
func ExistInDega(id, uID, sID uint) (*model.Rating, error) {
	url := fmt.Sprint(viper.GetString("dega.url"), "/fact-check/ratings/", id)
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

	var rating model.Rating
	err = json.NewDecoder(resp.Body).Decode(&rating)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode == http.StatusOK {
		return &rating, nil
	}
	return nil, errors.New("rating does not exist")
}
