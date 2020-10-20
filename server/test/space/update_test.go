package space

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceUpdate(t *testing.T) {
	mock := test.SetupMockDB()

	test.KavachGock()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("update a space", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns).
				AddRow(1, time.Now(), time.Now(), nil, "name", "slug", "site_title", "tag_line", "description", "site_address", nilJsonb(), nilJsonb(), nilJsonb(), 1))

		mock.ExpectBegin()
		mock.ExpectExec(`UPDATE \"space\"`).
			WithArgs(test.AnyTime{}, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		SelectQuery(mock, 1, 1)

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusOK).
			JSON().
			Object().
			ContainsMap(Data)

		test.ExpectationsMet(t, mock)
	})

	t.Run("invalid space id", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "invalid").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)
	})

	t.Run("invalid space body", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("undecodable space body", func(t *testing.T) {
		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("space record does not exist", func(t *testing.T) {
		mock.ExpectQuery(selectQuery).
			WithArgs(1).
			WillReturnRows(sqlmock.NewRows(Columns))

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusNotFound)

		test.ExpectationsMet(t, mock)
	})

	t.Run("member of organisation updating space", func(t *testing.T) {
		Data["organisation_id"] = 2

		e.PUT(path).
			WithPath("space_id", "1").
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)

		Data["organisation_id"] = 1
	})
}
