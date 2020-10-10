package videoAnalysis

import (
	"github.com/go-chi/chi"
)

type video struct {
    Url         string    `json:"url" validate:"required"`
    Title       string    `json:"title" validate:"required"`
    Summary     string    `json:"summary"`
    VideoType   string    `json:"video_type" validate:"required"`
}

type videoAnalysis struct {
    RatingValue     int     `json:"rating_value" validate:"required"`
    Claim           string  `json:"claim"`
    Fact            string  `json:"fact"`
    StartTime       int     `json:"start_time"`
    EndTime         int     `json:"end_time" validate:"required"`
    EndTimeFraction float64 `json:"end_time_fraction" validate:"required"`
}

type videoAnalysisApiData struct {
    Video video                 `json:"video" validate:"required"`
    Analysis []videoAnalysis    `json:"analysis" validate:"required"`
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
