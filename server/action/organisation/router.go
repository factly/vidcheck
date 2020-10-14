package organisation

import "github.com/go-chi/chi"

// Router - Group of organisations router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list) // GET /video - return list of organisation
	return r
}
