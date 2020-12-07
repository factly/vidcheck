package util

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/model"
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

type ctxKeySpaceID int

// SpaceIDKey is the key that holds the unique space ID in a request context.
const SpaceIDKey ctxKeySpaceID = 0

// CheckSpace check X-Space in header
func CheckSpace(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if strings.Split(strings.Trim(r.URL.Path, "/"), "/")[0] != "spaces" {
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

			var spaceObj *model.Space
			if !config.DegaIntegrated() {
				spaceObj = &model.Space{}
				spaceObj.ID = uint(sid)

				err = model.DB.First(&spaceObj).Error
				if err != nil {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
			} else {
				_, err := GetDegaSpace(ctx)
				if err != nil {
					w.WriteHeader(http.StatusUnauthorized)
					return
				}
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

// GetDegaSpace returns space ID from dega
func GetDegaSpace(ctx context.Context) (*model.Space, error) {
	if ctx == nil {
		return nil, errors.New("context not found")
	}
	spaceID := ctx.Value(SpaceIDKey)
	uID, err := GetUser(ctx)
	if err != nil {
		return nil, err
	}

	if spaceID != nil {
		url := fmt.Sprint(viper.GetString("dega.url"), "/core/spaces")
		req, _ := http.NewRequest("GET", url, nil)

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-User", fmt.Sprint(uID))

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}

		defer resp.Body.Close()

		var orgWithSpaceList []orgWithSpace
		err = json.NewDecoder(resp.Body).Decode(&orgWithSpaceList)
		if err != nil {
			return nil, err
		}

		for _, org := range orgWithSpaceList {
			for _, space := range org.Spaces {
				if int(space.ID) == spaceID.(int) {
					return &space, nil
				}
			}
		}
	}
	return nil, errors.New("something went wrong")
}
