package space

import (
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// space request body
type space struct {
	Name              string         `json:"name" validate:"required,min=3,max=50"`
	Slug              string         `json:"slug"`
	SiteTitle         string         `json:"site_title"`
	TagLine           string         `json:"tag_line"`
	Description       string         `json:"description"`
	SiteAddress       string         `json:"site_address"`
	VerificationCodes postgres.Jsonb `json:"verification_codes"`
	SocialMediaURLs   postgres.Jsonb `json:"social_media_urls"`
	ContactInfo       postgres.Jsonb `json:"contact_info"`
	OrganisationID    int            `json:"organisation_id" validate:"required"`
}

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", my)
	r.Route("/{space_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
