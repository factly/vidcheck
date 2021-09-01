package tag

import (
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// tag model
type tag struct {
	Name        string         `json:"name" validate:"required,min=3,max=50"`
	Slug        string         `json:"slug"`
	IsFeatured  bool           `json:"is_featured"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
	MediumID    uint           `json:"medium_id"`
}

var userContext model.ContextKey = "tag_user"

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "tags"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{tag_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
