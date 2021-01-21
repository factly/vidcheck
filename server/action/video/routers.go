package video

import (
	"time"

	"github.com/factly/vidcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type video struct {
	URL           string `json:"url" validate:"required"`
	Title         string `json:"title" validate:"required"`
	Summary       string `json:"summary"`
	VideoType     string `json:"video_type" validate:"required"`
	Status        string `json:"status"`
	TotalDuration int64  `json:"total_duration"`
}

type videoanalysis struct {
	ID              uint           `json:"id"`
	RatingID        uint           `json:"rating_id" validate:"required"`
	Claim           postgres.Jsonb `json:"claim" swaggertype:"primitive,string"`
	ClaimDate       time.Time      `json:"claim_date"`
	CheckedDate     time.Time      `json:"checked_date"`
	IsClaim         bool           `json:"is_claim"`
	Fact            postgres.Jsonb `json:"fact" swaggertype:"primitive,string"`
	ClaimantID      uint           `json:"claimant_id" validate:"required"`
	ReviewSources   postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	ClaimSources    postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	StartTime       int            `json:"start_time"`
	EndTime         int            `json:"end_time" validate:"required"`
	EndTimeFraction float64        `json:"end_time_fraction" validate:"required"`
}

type videoanalysisReqData struct {
	Video    video           `json:"video" validate:"required"`
	Analysis []videoanalysis `json:"analysis" validate:"required"`
}

type videoanalysisData struct {
	Video    model.Video      `json:"video"`
	Analysis []model.Analysis `json:"analysis"`
}

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
