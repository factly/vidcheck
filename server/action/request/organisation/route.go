package organisation

import (
	"net/http"

	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var permissionContext model.ContextKey = "org_perm_user"

type organisationPermissionRequest struct {
	OrganisationID uint           `json:"organisation_id" validate:"required"`
	Title          string         `json:"title"`
	Description    postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Spaces         int64          `json:"spaces"`
}

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	app := "vidcheck"

	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Get("/", list)
	r.Get("/my", my)
	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Route("/{request_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Post("/approve", approve)
		r.Post("/reject", reject)
	})

	return r
}
