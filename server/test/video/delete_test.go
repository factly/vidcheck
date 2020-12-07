package video

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect"
)

func TestVideoDelete(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("invalid video id", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		e.DELETE(path).
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

		e.DELETE(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusNotFound)
		test.ExpectationsMet(t, mock)
	})

	t.Run("delete video", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))
		mock.ExpectCommit()

		e.DELETE(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusOK)
		test.ExpectationsMet(t, mock)
	})

	t.Run("deleting video fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnError(errors.New(`deleting video fails`))
		mock.ExpectRollback()

		e.DELETE(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})

	t.Run("deleting analysis fails", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		SelectQuery(mock, 1, 1)

		mock.ExpectBegin()
		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "video"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnResult(sqlmock.NewResult(1, 1))

		mock.ExpectExec(regexp.QuoteMeta(`UPDATE "analysis"`)).
			WithArgs(test.AnyTime{}, 1).
			WillReturnError(errors.New(`deleting video analysis fails`))
		mock.ExpectRollback()

		e.DELETE(path).
			WithPath("video_id", "1").
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
	})
}
