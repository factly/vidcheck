package video

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/jinzhu/gorm/dialects/postgres"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/factly/vidcheck/test/rating"
	"github.com/gavv/httpexpect"
	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

func TestVideoCreate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	test.DegaGock()
	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.Off()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid video body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithJSON(invalidrequestData).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("undecodable video body", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.POST(basePath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusUnprocessableEntity)

		test.ExpectationsMet(t, mock)
	})

	t.Run("create a video with analysis", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["status"], Data["space_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		rating.SelectWithoutSpace(mock)
		rating.SelectWithoutSpace(mock)

		second := requestData["analysis"].([]map[string]interface{})[1]
		desc := postgres.Jsonb{RawMessage: []byte(`"` + second["description"].(string) + `"`)}
		mock.ExpectQuery(`INSERT INTO "analysis"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, analysisData["video_id"], analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["description"], analysisData["review_sources"], analysisData["end_time"], analysisData["start_time"], analysisData["end_time_fraction"], test.AnyTime{}, test.AnyTime{}, nil, second["video_id"], second["rating_id"], second["claim"], second["fact"], desc, second["review_sources"], second["end_time"], second["start_time"], second["end_time_fraction"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		analysisSelectQuery(mock, 1)

		rating.SelectWithoutSpace(mock)

		mock.ExpectCommit()

		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object()

		checkResponse(res)
		test.ExpectationsMet(t, mock)
	})

	t.Run("creating video fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["status"], Data["space_id"]).
			WillReturnError(errors.New(`creating video failed`))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("creating analysis blocks fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["status"], Data["space_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		rating.SelectWithoutSpace(mock)
		rating.SelectWithoutSpace(mock)

		second := requestData["analysis"].([]map[string]interface{})[1]
		desc := postgres.Jsonb{RawMessage: []byte(`"` + second["description"].(string) + `"`)}

		mock.ExpectQuery(`INSERT INTO "analysis"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, analysisData["video_id"], analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["description"], analysisData["review_sources"], analysisData["end_time"], analysisData["start_time"], analysisData["end_time_fraction"], test.AnyTime{}, test.AnyTime{}, nil, second["video_id"], second["rating_id"], second["claim"], second["fact"], desc, second["review_sources"], second["end_time"], second["start_time"], second["end_time_fraction"]).
			WillReturnError(errors.New(`creating analysis fails`))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("create a video with analysis when integrated with dega", func(t *testing.T) {
		viper.Set("dega_integration", true)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["space_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		second := requestData["analysis"].([]map[string]interface{})[1]
		mock.ExpectQuery(`INSERT INTO "analysis"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, analysisData["video_id"], analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["end_time"], analysisData["start_time"], analysisData["end_time_fraction"], test.AnyTime{}, test.AnyTime{}, nil, second["video_id"], second["rating_id"], second["claim"], second["fact"], second["end_time"], second["start_time"], second["end_time_fraction"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		analysisSelectQuery(mock, 1)

		mock.ExpectCommit()

		res := e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusCreated).
			JSON().
			Object()

		checkResponse(res)
		test.ExpectationsMet(t, mock)
		viper.Set("dega_integration", false)
	})

	t.Run("dega returns invalid response", func(t *testing.T) {
		viper.Set("dega_integration", true)

		gock.Off()

		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.Off()
		test.DegaSpaceGock()
		gock.New(viper.GetString("dega_url")).
			Get("/fact-check/ratings").
			MatchParam("all", "true").
			Persist().
			Reply(http.StatusInternalServerError)

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["space_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		viper.Set("dega_integration", false)
	})

	t.Run("ratings not in dega server", func(t *testing.T) {
		viper.Set("dega_integration", true)

		gock.Off()

		gock.New(testServer.URL).EnableNetworking().Persist()
		defer gock.Off()
		test.DegaSpaceGock()
		gock.New(viper.GetString("dega_url")).
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

		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "video"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["space_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))

		mock.ExpectRollback()

		e.POST(basePath).
			WithHeaders(headers).
			WithJSON(requestData).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		viper.Set("dega_integration", false)
	})

}
