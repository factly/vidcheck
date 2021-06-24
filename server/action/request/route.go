package request

import (
	"net/http"

	"github.com/factly/vidcheck/action/request/organisation"
	"github.com/factly/vidcheck/action/request/space"
	"github.com/go-chi/chi"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/spaces", space.Router())
	r.Mount("/organisations", organisation.Router())

	return r
}
