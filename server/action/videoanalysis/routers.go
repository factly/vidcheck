package videoanalysis

import (
	"time"

	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type video struct {
	URL       string `json:"url" validate:"required"`
	Title     string `json:"title" validate:"required"`
	Summary   string `json:"summary"`
	VideoType string `json:"video_type" validate:"required"`
}

type videoAnalysis struct {
	ID              uint           `json:"id"`
	RatingID        uint           `json:"rating_id" validate:"required"`
	Claim           postgres.Jsonb `json:"claim" swaggertype:"primitive,string"`
	ClaimDate       time.Time      `json:"claim_date"`
	CheckedDate     time.Time      `json:"checked_date"`
	IsClaim         bool           `json:"is_claim"`
	Fact            postgres.Jsonb `json:"fact" swaggertype:"primitive,string"`
	ReviewSources   postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	ClaimSources    postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	StartTime       int            `json:"start_time"`
	EndTime         int            `json:"end_time" validate:"required"`
	EndTimeFraction float64        `json:"end_time_fraction" validate:"required"`
}

type videoAnalysisApiData struct {
	Video    video           `json:"video" validate:"required"`
	Analysis []videoAnalysis `json:"analysis" validate:"required"`
}

// Router - Group of videoAnalysis router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)    // GET /video - return list of videos
	r.Post("/", create) // POST /video - create a new video and persist it

	r.Route("/video/{video_id}/analysis/{video_analysis_id}", func(r chi.Router) {
		r.Get("/", details)   // GET /videos/{video_id}/analysis/{video_analysis_id}
		r.Put("/", update)    // PUT /videos/{video_id}/analysis/{video_analysis_id}
		r.Delete("/", delete) // DELETE /videos/{video_id}/analysis/{video_analysis_id}
	})
	return r
}
