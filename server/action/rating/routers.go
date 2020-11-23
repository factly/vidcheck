package rating

import (
	"github.com/go-chi/chi"
)

// rating model
type rating struct {
	Name         string `json:"name" validate:"required,min=3,max=50"`
	Slug         string `json:"slug"`
	Description  string `json:"description"`
	NumericValue int    `json:"numeric_value" validate:"required"`
	Colour       string `json:"colour"`
}

// Router - Group of rating router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Post("/default", createDefaults)

	r.Route("/{rating_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
