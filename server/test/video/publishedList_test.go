package video

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/factly/vidcheck/test/rating"
	"github.com/gavv/httpexpect"
)

func TestPublishedVideoList(t *testing.T) {
	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("get video list", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WithArgs("published", 1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(videolist)))

		mock.ExpectQuery(selectQuery).
			WithArgs("published", 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, videolist[0]["url"], videolist[0]["title"], videolist[0]["summary"], videolist[0]["video_type"], videolist[0]["status"], videolist[0]["space_id"]).
				AddRow(2, time.Now(), time.Now(), nil, videolist[1]["url"], videolist[1]["title"], videolist[1]["summary"], videolist[1]["video_type"], videolist[1]["status"], videolist[1]["space_id"]))
		analysisSelectQuery(mock, 1)
		rating.SelectWithoutSpace(mock)
		analysisSelectQuery(mock, 2)
		rating.SelectWithoutSpace(mock)

		e.GET(publishedPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(videolist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			Value("video").
			Object().
			ContainsMap(videolist[0])

		test.ExpectationsMet(t, mock)
	})

	t.Run("get video list with paiganation", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(countQuery).
			WithArgs("published", 1).
			WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(len(videolist)))

		mock.ExpectQuery(selectQuery).
			WithArgs("published", 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(2, time.Now(), time.Now(), nil, videolist[1]["url"], videolist[1]["title"], videolist[1]["summary"], videolist[1]["video_type"], videolist[1]["status"], videolist[1]["space_id"]))
		analysisSelectQuery(mock, 2)
		rating.SelectWithoutSpace(mock)

		e.GET(publishedPath).
			WithHeaders(headers).
			WithQueryObject(map[string]interface{}{
				"page":  "2",
				"limit": "1",
			}).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(map[string]interface{}{"total": len(videolist)}).
			Value("nodes").
			Array().
			Element(0).
			Object().
			Value("video").
			Object().
			ContainsMap(videolist[1])

		test.ExpectationsMet(t, mock)
	})
}
