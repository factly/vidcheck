package action

import (
	"fmt"
	"net/http"

	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/action/space"
	"github.com/factly/vidcheck/action/videoanalysis"
	"github.com/spf13/viper"

	"github.com/factly/vidcheck/action/video"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

// RegisterRoutes - register routes
func RegisterRoutes() http.Handler {

	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(loggerx.Init())
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(middleware.Heartbeat("/ping"))

	r.Use(cors.Handler(cors.Options{
		// AllowedOrigins: []string{"https://foo.com"}, // Use this to allow specific origin hosts
		AllowedOrigins: []string{"*"},
		// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	if viper.IsSet("mode") && viper.GetString("mode") == "development" {
		r.Get("/swagger/*", httpSwagger.WrapHandler)
		fmt.Println("swagger-ui http://localhost:8080/swagger/index.html")
	}

	r.With(util.CheckUser, util.CheckSpace, util.CheckOrganisation).Group(func(r chi.Router) {
		r.Mount("/analysis", videoanalysis.Router())
		r.Mount("/videos", video.Router())
		if !config.DegaIntegrated() {
			r.Mount("/spaces", space.Router())
			r.Mount("/ratings", rating.Router())
		}
	})
	return r
}
