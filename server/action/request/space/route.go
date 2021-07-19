package space

import (
	"net/http"

	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var permissionContext model.ContextKey = "space_perm_user"

type spacePermissionRequest struct {
	Title       string         `json:"title"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Media       int64          `json:"media"`
	Videos      int64          `json:"videos"`
	SpaceID     int64          `json:"space_id" validate:"required"`
}

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Get("/", list)
	r.Get("/my", my)
	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Route("/{request_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Post("/approve", approve)
		r.Post("/reject", reject)
	})

	return r
}
