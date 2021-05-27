package rating

import (
	"github.com/factly/vidcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// rating model
type rating struct {
	Name             string         `json:"name" validate:"required,min=3,max=50"`
	Slug             string         `json:"slug"`
	Description      string         `json:"description"`
	NumericValue     int            `json:"numeric_value" validate:"required"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb `json:"text_colour" validate:"required" swaggertype:"primitive,string"`
}

var userContext model.ContextKey = "rating_user"

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
