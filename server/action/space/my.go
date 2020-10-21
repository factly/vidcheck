package space

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

type organisationUser struct {
	model.Base
	Role string `gorm:"column:role" json:"role"`
}

type orgWithSpace struct {
	model.Base
	Title      string           `gorm:"column:title" json:"title"`
	Slug       string           `gorm:"column:slug;unique_index" json:"slug"`
	Permission organisationUser `json:"permission"`
	Spaces     []model.Space    `json:"spaces"`
}

// list - Get all spaces for a user
// @Summary Show all spaces
// @Description Get all spaces
// @Tags Space
// @ID get-all-spaces
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {array} []orgWithSpace
// @Router /spaces [get]
func my(w http.ResponseWriter, r *http.Request) {
	uID, err := util.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	allOrgs, err := getMyOrganisations(uID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	var allOrgIDs []int

	for _, each := range allOrgs {
		allOrgIDs = append(allOrgIDs, int(each.ID))
	}

	// Fetched all the spaces related to all the organisations
	var allSpaces = make([]model.Space, 0)

	model.DB.Model(model.Space{}).Where("organisation_id IN (?)", allOrgIDs).Find(&allSpaces)

	orgSpaceMap := make(map[uint][]model.Space)

	for _, space := range allSpaces {
		if _, found := orgSpaceMap[uint(space.OrganisationID)]; !found {
			orgSpaceMap[uint(space.OrganisationID)] = make([]model.Space, 0)
		}
		orgSpaceMap[uint(space.OrganisationID)] = append(orgSpaceMap[uint(space.OrganisationID)], space)
	}

	for i := range allOrgs {
		if _, found := orgSpaceMap[allOrgs[i].ID]; found {
			allOrgs[i].Spaces = orgSpaceMap[allOrgs[i].ID]
		} else {
			allOrgs[i].Spaces = make([]model.Space, 0)
		}
	}

	renderx.JSON(w, http.StatusOK, allOrgs)
}

func getMyOrganisations(uID int) ([]orgWithSpace, error) {
	// Fetched all organisations of the user
	req, err := http.NewRequest("GET", viper.GetString("kavach.url")+"/organisations/my", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-User", strconv.Itoa(uID))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, err
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	allOrg := []orgWithSpace{}
	err = json.Unmarshal(body, &allOrg)

	if err != nil {
		return nil, err
	}

	return allOrg, nil
}
