package author

import (
	"context"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/middlewarex"
)

// All - to return all authors
func All(ctx context.Context) (map[string]model.Author, error) {
	authors := make(map[string]model.Author)

	organisationID, err := util.GetOrganisation(ctx)

	if err != nil {
		return authors, err
	}

	userID, err := middlewarex.GetUser(ctx)

	if err != nil {
		return authors, err
	}

	authors = Mapper(organisationID, userID)

	return authors, nil

}
