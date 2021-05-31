package claimant

import (
	"github.com/factly/vidcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// claimant model
type claimant struct {
	Name        string         `json:"name" validate:"required,min=3,max=50"`
	Slug        string         `json:"slug"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	TagLine     string         `json:"tag_line"`
	MediumID    uint           `json:"medium_id"`
}

var userContext model.ContextKey = "claimant_user"

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{claimant_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
