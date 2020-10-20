package space

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceMy(t *testing.T) {
	mock := test.SetupMockDB()

	test.KavachGock()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get my spaces", func(t *testing.T) {
		SelectQuery(mock, 1, 2)
		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusOK).
			JSON().
			Array().
			Element(0).
			Object().
			ContainsMap(Data)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid space header", func(t *testing.T) {
		e.GET(basePath).
			WithHeader("X-User", "invalid").
			Expect().
			Status(http.StatusUnauthorized)
	})

	t.Run("when kavach is down", func(t *testing.T) {
		gock.Off()

		e.GET(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusInternalServerError)
	})
}
