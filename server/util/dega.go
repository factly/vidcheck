package util

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
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

			log.Println("space, err", space, err)

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

			req, _ := http.NewRequest(r.Method, url, nil)

			req.Header = r.Header
			req.Body = r.Body

			client := &http.Client{}
			resp, err := client.Do(req)
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
