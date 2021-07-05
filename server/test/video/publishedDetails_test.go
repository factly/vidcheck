package video

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/factly/vidcheck/test/rating"
	"github.com/gavv/httpexpect"
)

func TestPublishedVideoDetails(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get video details", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, "publish", 1, 1)

		analysisSelectQuery(mock, 1)

		rating.SelectWithoutSpace(mock)

		res := e.GET(publishedDetailsPath).
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
		e.GET(publishedDetailsPath).
			WithPath("video_id", "invalid").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("video record does not exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs("publish", 1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.GET(publishedDetailsPath).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
	})
}
