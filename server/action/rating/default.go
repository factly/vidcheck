package rating

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
)

// DataFile default json data file
var DataFile = "./data/ratings.json"

// createDefaults - Create Default Ratings
// @Summary Create Default Ratings
// @Description Create Default Ratings
// @Tags Rating
// @ID add-default-ratings
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 201 {object} []model.Rating
// @Failure 400 {array} string
// @Router /ratings/default [post]
func createDefaults(w http.ResponseWriter, r *http.Request) {
	sID, err := util.GetSpace(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	jsonFile, err := os.Open(DataFile)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer jsonFile.Close()

	ratings := make([]model.Rating, 0)

	byteValue, _ := ioutil.ReadAll(jsonFile)
	err = json.Unmarshal(byteValue, &ratings)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	tx := model.DB.Begin()

	for i := range ratings {
		ratings[i].SpaceID = uint(sID)
		tx.Model(&model.Rating{}).Create(&ratings[i])
	}

	tx.Commit()

	renderx.JSON(w, http.StatusCreated, ratings)
}
