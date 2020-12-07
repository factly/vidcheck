package video

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/factly/vidcheck/test/rating"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect"
)

func TestVideoDetails(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	test.DegaGock()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.Off()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	test.DegaGock()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.Off()

	t.Run("get video details", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		analysisSelectQuery(mock, 1)

		rating.SelectWithoutSpace(mock)

		res := e.GET(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()

		checkResponse(res)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid video id", func(t *testing.T) {
		test.CheckSpaceMock(mock)
		e.GET(path).
			WithPath("video_id", "invalid").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("video record does not exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("get video details when dega integrated", func(t *testing.T) {
		viper.Set("dega.integration", true)

		SelectQuery(mock, 1, 1)

		analysisSelectQuery(mock, 1)

		res := e.GET(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()

		checkResponse(res)
		test.ExpectationsMet(t, mock)
		viper.Set("dega.integration", false)
	})

	t.Run("dega returns invalid response", func(t *testing.T) {
		viper.Set("dega.integration", true)
		gock.Off()

		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.Off()
		test.DegaSpaceGock()
		gock.New(viper.GetString("dega.url")).
			Get("/fact-check/ratings").
			MatchParam("all", "true").
			Persist().
			Reply(http.StatusInternalServerError)

		SelectQuery(mock, 1, 1)

		analysisSelectQuery(mock, 1)

		e.GET(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
		viper.Set("dega.integration", false)
	})
}
