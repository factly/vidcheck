package embed

import (
	"github.com/factly/vidcheck/model"
	"github.com/factly/vidcheck/util"
	"github.com/go-chi/chi"
)

type videoResData struct {
	Video  model.Video   `json:"video"`
	Claims []model.Claim `json:"claims"`
}

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSpace).Get("/", list) // GET /videos/embed - return list of videos.
	r.Route("/{video_id}", func(r chi.Router) {
		r.Get("/", publishedDetails) // GET /videos/embed/{video_id} - read a single video by :video_id
	})

	return r
}
