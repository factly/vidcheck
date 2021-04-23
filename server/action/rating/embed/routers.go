package embed

import (
	"github.com/factly/vidcheck/util"
	"github.com/go-chi/chi"
)

// Router - Group of video router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSpace).Get("/", list) // GET /ratings/embed - return list of ratings.

	return r
}
