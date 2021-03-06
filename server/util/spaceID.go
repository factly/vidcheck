package util

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/vidcheck/model"
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

type ctxKeySpaceID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0

// CheckSpace check X-Space in header
func CheckSpace(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		action := strings.Split(strings.Trim(r.URL.Path, "/"), "/")[0]

		if action != "spaces" {
			space := r.Header.Get("X-Space")
			if space == "" {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			sid, err := strconv.Atoi(space)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			ctx := r.Context()
			ctx = context.WithValue(ctx, SpaceIDKey, sid)

			var spaceObj model.Space

			spaceObj.ID = uint(sid)

			err = model.DB.First(&spaceObj).Error
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				return
			}

			h.ServeHTTP(w, r.WithContext(ctx))
			return
		}
		h.ServeHTTP(w, r)
	})
}

// GetSpace return space ID
func GetSpace(ctx context.Context) (int, error) {
	if ctx == nil {
		return 0, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey)
	if spaceID != nil {
		return spaceID.(int), nil
	}
	return 0, errors.New("something went wrong")
}
