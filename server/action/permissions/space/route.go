package space

import (
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

type spacePermission struct {
	SpaceID uint  `json:"space_id" validate:"required"`
	Media   int64 `json:"media"`
	Videos  int64 `json:"videos"`
}

var userContext model.ContextKey = "space_perm_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Get("/", list)
	r.Get("/my", my)
	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Post("/", create)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Get("/", details)
		r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Put("/", update)
		r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Delete("/", delete)
	})

	return r
}
