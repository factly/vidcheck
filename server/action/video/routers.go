package video

import (
	"time"

	"github.com/factly/vidcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type video struct {
	URL           string     `json:"url" validate:"required"`
	Title         string     `json:"title" validate:"required"`
	Slug          string     `json:"slug" validate:"required"`
	Summary       string     `json:"summary"`
	VideoType     string     `json:"video_type" validate:"required"`
	Status        string     `json:"status"`
	TotalDuration int        `json:"total_duration" validate:"required"`
	CategoryIDs   []uint     `json:"category_ids"`
	TagIDs        []uint     `json:"tag_ids"`
	AuthorIDs     []uint     `json:"author_ids"`
	PublishedDate *time.Time `json:"published_date"`
}

type videoanalysis struct {
	ID            uint           `json:"id"`
	RatingID      uint           `json:"rating_id" validate:"required"`
	Claim         string         `json:"claim" swaggertype:"primitive,string"`
	ClaimDate     *time.Time     `json:"claim_date"`
	CheckedDate   *time.Time     `json:"checked_date"`
	Fact          string         `json:"fact" swaggertype:"primitive,string"`
	ClaimantID    uint           `json:"claimant_id" validate:"required"`
	ReviewSources postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	ClaimSources  postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	Description   postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	StartTime     int            `json:"start_time"`
	EndTime       int            `json:"end_time" validate:"required"`
}

type VideoData struct {
	model.Video
	Authors []model.Author `json:"authors"`
}

type videoReqData struct {
	Video  video           `json:"video" validate:"required"`
	Claims []videoanalysis `json:"claims" validate:"required"`
}

type videoResData struct {
	Video  VideoData         `json:"video"`
	Claims []model.ClaimData `json:"claims"`
}

type iFramelyRes struct {
	ThumbnailURL string `json:"thumbnail_url,omitempty"`
}

var userContext model.ContextKey = "video_user"

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)    // GET /video - return list of videos.
	r.Post("/", create) // POST /video - create a new video and persist it.
	r.Route("/{video_id}", func(r chi.Router) {
		r.Get("/published", publishedDetails)
		r.Get("/", details)   // GET /videos/{video_id} - read a single video by :video_id
		r.Put("/", update)    // PUT /videos/{video_id} - update a single video by :video_id
		r.Delete("/", delete) // DELETE /videos/{video_id} - delete a single video by :video_id
	})

	return r
}
