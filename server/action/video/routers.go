package video

import (
	"github.com/go-chi/chi"
)


// Video request body
type Video struct {
	Status      string    `json:"status"`
	Url         string    `json:"url" validate:"required"`
	Title       string    `json:"title" validate:"required"`
	Summary     string    `json:"Summary"`
	VideoType   string    `json:"video_type" validate:"required"`
}

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)    // GET /video - return list of videos
	r.Route("/{video_id}", func(r chi.Router) {
		r.Get("/", details)   // GET /videos/{video_id} - read a single video by :video_id
		r.Put("/", update)    // PUT /videos/{video_id} - update a single video by :video_id
		r.Delete("/", delete) // DELETE /videos/{video_id} - delete a single video by :video_id
	})

	return r
}
