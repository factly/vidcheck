package util

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/factly/x/requestx"
	"github.com/spf13/viper"
)

// CheckDegaEnable check X-Space in header
func CheckDegaEnable(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		action := strings.Split(strings.Trim(r.URL.Path, "/"), "/")[0]

		factCheck := []string{"ratings", "claimants"}

		isContains := contains(factCheck, action)

		if viper.GetBool("dega_integration") && action == "videos" {

			ctx := r.Context()

			space, err := GetDegaSpace(r.Header)

			if err != nil {
				loggerx.Error(err)
				errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
				return
			}

			ctx = context.WithValue(ctx, SpaceIDKey, int(space.ID))
			ctx = context.WithValue(ctx, OrganisationIDKey, space.OrganisationID)

			h.ServeHTTP(w, r.WithContext(ctx))
			return

		}

		if isContains || action != "videos" {

			service := "core"

			if isContains {
				service = "fact-check"
			}

			url := fmt.Sprint(viper.GetString("dega_url"), "/", service, r.URL.Path)

			header := r.Header

			resp, err := requestx.Request(r.Method, url, nil, map[string]string{
				"Content-Type": "application/json",
				"X-User":       header.Get("X-User"),
				"X-Space":      header.Get("X-Space"),
			})

			if err != nil {
				errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
				return
			}
			defer resp.Body.Close()

			var res interface{}
			err = json.NewDecoder(resp.Body).Decode(&res)

			if err != nil {
				errorx.Render(w, errorx.Parser(errorx.DecodeError()))
				return
			}

			renderx.JSON(w, resp.StatusCode, res)
			return
		}

		h.ServeHTTP(w, r)
	})
}

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
