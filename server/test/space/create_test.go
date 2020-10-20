package space

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect"
	"gopkg.in/h2non/gock.v1"
)

func TestSpaceCreate(t *testing.T) {
	mock := test.SetupMockDB()

	test.KavachGock()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	gock.New(testServer.URL).EnableNetworking().Persist()
	defer gock.DisableNetworking()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create a space", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "space"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1))
		mock.ExpectCommit()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusCreated)

		test.ExpectationsMet(t, mock)
	})

	t.Run("creating a space fails", func(t *testing.T) {
		mock.ExpectBegin()
		mock.ExpectQuery(`INSERT INTO "space"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]).
			WillReturnError(errors.New(`cannot create space`))
		mock.ExpectRollback()

		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusInternalServerError)

		test.ExpectationsMet(t, mock)
	})

	t.Run("unprocessable space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(invalidData).
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("unable to decode space body", func(t *testing.T) {
		e.POST(basePath).
			WithHeader("X-User", "1").
			Expect().
			Status(http.StatusUnprocessableEntity)
	})

	t.Run("organisation_id = 0 in space body", func(t *testing.T) {
		Data["organisation_id"] = 0
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data)
		Data["organisation_id"] = 1
	})

	t.Run("member of organisation creating space", func(t *testing.T) {
		Data["organisation_id"] = 2
		e.POST(basePath).
			WithHeader("X-User", "1").
			WithJSON(Data).
			Expect().
			Status(http.StatusUnauthorized)
		Data["organisation_id"] = 1
	})
}
