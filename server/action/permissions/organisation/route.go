package organisation

import (
	"github.com/factly/vidcheck/config"
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

type organisationPermission struct {
	OrganisationID uint  `json:"organisation_id" validate:"required"`
	Spaces         int64 `json:"spaces"`
}

var userContext model.ContextKey = "org_perm_user"

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Get("/", list)
	r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Post("/", create)
	r.Get("/my", details)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Put("/", update)
		r.With(middlewarex.CheckSuperOrganisation(config.AppName, util.GetOrganisation)).Delete("/", delete)
	})

	return r

}
