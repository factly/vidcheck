package video

import (
	"github.com/go-chi/chi"
)


type video struct {
    id          uint      `json:"id"`
    Url         string    `json:"url" validate:"required"`
    Title       string    `json:"title" validate:"required"`
    Summary     string    `json:"summary"`
    VideoType   string    `json:"video_type" validate:"required"`
}

type videoAnalysis struct {
    id              uint    `json:"id"`
    RatingValue     int     `json:"rating_value" validate:"required"`
    Claim           string  `json:"claim"`
    Fact            string  `json:"fact"`
    StartTime       int     `json:"start_time"`
    EndTime         int     `json:"end_time" validate:"required"`
    EntTimeFraction float64 `json:"end_time_fraction" validate:"required"`
}

type videoAnalysisApiData struct {
    Video video                 `json:"video" validate:"required"`
    Analysis []videoAnalysis    `json:"analysis" validate:"required"`
}

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)    // GET /video - return list of videos.
	r.Post("/", create) // POST /video - create a new video and persist it.
	r.Route("/{video_id}", func(r chi.Router) {
		r.Get("/", details)   // GET /videos/{video_id} - read a single video by :video_id
		r.Put("/", update)    // PUT /videos/{video_id} - update a single video by :video_id
		r.Delete("/", delete) // DELETE /videos/{video_id} - delete a single video by :video_id
	})

	return r
}