package videoAnalysis

import (
	"github.com/go-chi/chi"
)

// VideoAnalysis request body
type videoAnalysis struct {
    ID          uint    `json: "id"`
	Status      string  `json: "status"`
	VideoID     int     `json: "video_id" validate:"required"`
	UserID      int     `json: "user_id" validate:"required"`
	RatingValue int     `json: "rating_value" validate: "required"`
	Description string  `json: "description"`
	StartTime   int     `json: "start_time"`
	EndTime     int     `json: "end_time" validate: "required"`
	Note        string  `json: "note"`
}


// Router - Group of videoAnalysis router
func Router() chi.Router {
	r := chi.NewRouter()

    r.Get("/video/{video_id}/analysis", list)    // GET /video - return list of videos
	r.Post("/video/{video_id}/analysis", create) // POST /video - create a new video and persist it

	r.Route("/video/{video_id}/analysis/{video_analysis_id}", func(r chi.Router) {
		r.Get("/", details)   // GET /videos/{video_id}/analysis/{video_analysis_id}
		r.Put("/", update)    // PUT /videos/{video_id}/analysis/{video_analysis_id}
		r.Delete("/", delete) // DELETE /videos/{video_id}/analysis/{video_analysis_id}
	})
	return r
}
