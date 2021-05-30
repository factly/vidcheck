package action

import (
	"fmt"
	"net/http"

	"github.com/factly/vidcheck/action/claimant"
	"github.com/factly/vidcheck/action/medium"

	"github.com/factly/vidcheck/model"

	"github.com/factly/vidcheck/config"

	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/action/space"
	"github.com/spf13/viper"

	ratingEmbed "github.com/factly/vidcheck/action/rating/embed"
	"github.com/factly/vidcheck/action/video"
	"github.com/factly/vidcheck/action/video/embed"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/healthx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
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

	if viper.IsSet("mode") && viper.GetString("mode") == "development" {
		r.Get("/swagger/*", httpSwagger.WrapHandler)
		fmt.Println("swagger-ui http://localhost:7740/swagger/index.html")
	}

	sqlDB, _ := model.DB.DB()
	healthx.RegisterRoutes(r, healthx.ReadyCheckers{
		"database": sqlDB.Ping,
		"kavach":   util.KavachChecker,
	})

	r.With(middlewarex.CheckUser, util.CheckSpace).Group(func(r chi.Router) {
		r.Mount("/videos", video.Router())
		r.Mount("/claimants", claimant.Router())
		r.Mount("/media", medium.Router())
		if !config.DegaIntegrated() {
			r.Mount("/spaces", space.Router())
			r.Mount("/ratings", rating.Router())
		}
	})

	r.Mount("/videos/embed", embed.Router())
	r.Mount("/ratings/embed", ratingEmbed.Router())
	return r
}
