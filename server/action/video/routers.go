package video

import (
	"github.com/go-chi/chi"
)

Url         string `gorm:"not null, unique"`
Title       string `gorm:"null"`
TotalTime   int    `gorm:"not null"`
Description string
VideoType   string

// Video request body
type Video struct {
    ID          uint      `json: "id"`
	Status      string    `json:"status"`
	Url         string    `json:"user_id" validate:"required"`
	Title       string    `json:"title" validate:"required"`
	Description string    `json:"description" validate:"required"`
	VideoType   string    `json:"video_type" validate:"required"`
}

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)    // GET /video - return list of videos
	r.Post("/", create) // POST /video - create a new video and persist it

	r.Route("/{video_id}", func(r chi.Router) {
		r.Get("/", details)   // GET /videos/{video_id} - read a single video by :video_id
		r.Put("/", update)    // PUT /videos/{video_id} - update a single video by :video_id
		r.Delete("/", delete) // DELETE /videos/{video_id} - delete a single video by :video_id
	})

	return r
}
