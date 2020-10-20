package rating

import (
	"regexp"
	"strings"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/factly/vidcheck/test"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"name":          "True",
	"slug":          "true",
	"description":   "article is validated",
	"numeric_value": 5,
}

var defaultData = []map[string]interface{}{
	{
		"name":          "True",
		"slug":          "true",
		"description":   "True",
		"numeric_value": 5,
	},
	{
		"name":          "Partly True",
		"slug":          "partly-true",
		"description":   "Partly True",
		"numeric_value": 4,
	},
	{
		"name":          "Misleading",
		"slug":          "misleading",
		"description":   "Misleading",
		"numeric_value": 3,
	},
	{
		"name":          "Partly False",
		"slug":          "partly-false",
		"description":   "Partly False",
		"numeric_value": 2,
	},
	{
		"name":          "False",
		"slug":          "false",
		"description":   "False",
		"numeric_value": 1,
	},
}

var invalidData = map[string]interface{}{
	"name":          "a",
	"numeric_value": 0,
}

var columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "description", "numeric_value", "space_id"}

var selectQuery = regexp.QuoteMeta(`SELECT * FROM "rating"`)
var countQuery = regexp.QuoteMeta(`SELECT count(1) FROM "rating"`)
var deleteQuery = regexp.QuoteMeta(`UPDATE "rating" SET "deleted_at"=`)

var basePath = "/ratings"
var defaultsPath = "/ratings/default"
var path = "/ratings/{rating_id}"

func SelectWithSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["description"], Data["numeric_value"], 1))
}

func SelectWithoutSpace(mock sqlmock.Sqlmock) {
	mock.ExpectQuery(selectQuery).
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows(columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["description"], Data["numeric_value"], 1))
}

func sameNameCount(mock sqlmock.Sqlmock, count int, name interface{}) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT count(1) FROM "rating"`)).
		WithArgs(1, strings.ToLower(name.(string))).
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(count))
}

func ratingInsertMock(mock sqlmock.Sqlmock) {
	mock.ExpectBegin()
	mock.ExpectQuery(`INSERT INTO "rating"`).
		WithArgs(test.AnyTime{}, test.AnyTime{}, nil, Data["name"], Data["slug"], Data["description"], Data["numeric_value"], 1).
		WillReturnRows(sqlmock.
			NewRows([]string{"id"}).
			AddRow(1))
	mock.ExpectCommit()
}
