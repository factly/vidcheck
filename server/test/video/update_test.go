package video

import (
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/factly/vidcheck/test/rating"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestVideoUpdate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	test.DegaGock()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.Off()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("update a video with analysis", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "url", "title", "summary", "video_type", 1))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, Data["title"], Data["summary"], Data["video_type"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock, 1, 1)

		rating.SelectWithoutSpace(mock)
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["end_time"], analysisData["end_time_fraction"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		rating.SelectWithoutSpace(mock)
		second := requestData["analysis"].([]map[string]interface{})[1]
		mock.ExpectQuery(`INSERT INTO "analysis"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, second["video_id"], second["rating_id"], second["claim"], second["fact"], second["end_time"], second["start_time"], second["end_time_fraction"]).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).
				AddRow(2))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, 1, 2, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		analysisSelectQuery(mock, 1)

		rating.SelectWithoutSpace(mock)

		res := e.PUT(path).
			WithPath("video_id", 1).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object()
		checkResponse(res)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid video id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("video_id", "invalid").
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid request body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			WithJSON(invalidrequestData).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable request body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.PUT(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)
		test.ExpectationsMet(t, mock)
	})

	t.Run("video record does not exist", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("video_id", 1).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("update a video with analysis when integrated with dega", func(t *testing.T) {
		viper.Set("dega.integration", true)

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "url", "title", "summary", "video_type", 1))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, Data["title"], Data["summary"], Data["video_type"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock, 1, 1)

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["end_time"], analysisData["end_time_fraction"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		second := requestData["analysis"].([]map[string]interface{})[1]
		mock.ExpectQuery(`INSERT INTO "analysis"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, second["video_id"], second["rating_id"], second["claim"], second["fact"], second["end_time"], second["start_time"], second["end_time_fraction"]).
			WillReturnRows(sqlmock.NewRows([]string{"id"}).
				AddRow(2))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, 1, 2, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		analysisSelectQuery(mock, 1)

		res := e.PUT(path).
			WithPath("video_id", 1).
			WithHeaders(headers).
			WithJSON(requestData).
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

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "url", "title", "summary", "video_type", 1))

		e.PUT(path).
			WithPath("video_id", 1).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		viper.Set("dega.integration", false)
	})

	t.Run("ratings not in dega server while updating analysis block", func(t *testing.T) {
		viper.Set("dega.integration", true)
		gock.Off()

		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.Off()
		test.DegaSpaceGock()
		gock.New(viper.GetString("dega.url")).
			Get("/fact-check/ratings").
			MatchParam("all", "true").
			Persist().
			Reply(http.StatusOK).
			JSON(map[string]interface{}{
				"total": 1,
				"nodes": []map[string]interface{}{
					test.AnotherRating,
				},
			})

		mock.ExpectQuery(selectQuery).
			WithArgs(1, 1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "url", "title", "summary", "video_type", 1))

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, Data["title"], Data["summary"], Data["video_type"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		SelectQuery(mock, 1, 1)
		mock.ExpectRollback()

		e.PUT(path).
			WithPath("video_id", 1).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		viper.Set("dega.integration", false)
	})
}
