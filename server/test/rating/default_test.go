package rating

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/action"
	"github.com/factly/vidcheck/action/rating"
	"github.com/factly/vidcheck/test"
	"github.com/gavv/httpexpect/v2"
)

func TestDefaultRatingCreate(t *testing.T) {

	mock := test.SetupMockDB()

	testServer := httptest.NewServer(action.RegisterRoutes())
	defer testServer.Close()

	rating.DataFile = "../../data/ratings.json"

	// create httpexpect instance
	e := httpexpect.New(t, testServer.URL)

	t.Run("create default ratings", func(t *testing.T) {
		test.CheckSpaceMock(mock)

		mock.ExpectBegin()

		mock.ExpectQuery(`INSERT INTO "rating"`).
			WithArgs(test.AnyTime{}, test.AnyTime{}, nil, defaultData[0]["name"], defaultData[0]["slug"], defaultData[0]["description"], defaultData[0]["numeric_value"], "", 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[1]["name"], defaultData[1]["slug"], defaultData[1]["description"], defaultData[1]["numeric_value"], "", 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[2]["name"], defaultData[2]["slug"], defaultData[2]["description"], defaultData[2]["numeric_value"], "", 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[3]["name"], defaultData[3]["slug"], defaultData[3]["description"], defaultData[3]["numeric_value"], "", 1, test.AnyTime{}, test.AnyTime{}, nil, defaultData[4]["name"], defaultData[4]["slug"], defaultData[4]["description"], defaultData[4]["numeric_value"], "", 1).
			WillReturnRows(sqlmock.
				NewRows([]string{"id"}).
				AddRow(1).AddRow(2).AddRow(3).AddRow(4).AddRow(5))

		mock.ExpectCommit()

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusCreated).JSON().Array()
		test.ExpectationsMet(t, mock)
	})

	t.Run("when cannot open data file", func(t *testing.T) {
		rating.DataFile = "nofile.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		rating.DataFile = "../../data/ratings.json"

		test.ExpectationsMet(t, mock)
	})

	t.Run("when cannot parse data file", func(t *testing.T) {
		rating.DataFile = "invalidData.json"
		test.CheckSpaceMock(mock)

		e.POST(defaultsPath).
			WithHeaders(headers).
			Expect().
			Status(http.StatusInternalServerError)
		test.ExpectationsMet(t, mock)
		rating.DataFile = "../../data/ratings.json"
	})
}
