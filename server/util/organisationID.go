package util

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/factly/vidcheck/model"
)

type ctxKeyOrganisationID int

// OrganisationIDKey is the key that holds the unique organisation ID in a request context.
const OrganisationIDKey ctxKeyOrganisationID = 0

// CheckOrganisation check X-Organisation in header
func CheckOrganisation(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if strings.Split(strings.Trim(r.URL.Path, "/"), "/")[0] != "spaces" {
			ctx := r.Context()
			sID, err := GetSpace(ctx)

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			space := &model.Space{}
			space.ID = uint(sID)

			err = model.DB.First(&space).Error

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx = context.WithValue(ctx, OrganisationIDKey, space.OrganisationID)
			h.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		h.ServeHTTP(w, r)
	})
}

// GetOrganisation return organisation ID
func GetOrganisation(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	organisationID := ctx.Value(OrganisationIDKey)
	if organisationID != nil {
		return organisationID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
