package video

import (
	"database/sql/driver"
	"regexp"
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gavv/httpexpect"
)

var headers = map[string]string{
	"X-Space": "1",
	"X-User":  "1",
}

var Data = map[string]interface{}{
	"url":        "testvideo.com",
	"title":      "Test Video",
	"summary":    "test summary",
	"video_type": "mp4",
	"status":     "publish",
	"space_id":   1,
}

var videolist = []map[string]interface{}{
	{
		"url":        "testvideo1.com",
		"title":      "Test Video 1",
		"summary":    "test summary 1",
		"video_type": "mp4",
		"status":     "publish",
		"space_id":   1,
	},
	{
		"url":        "testvideo2.com",
		"title":      "Test Video 2",
		"summary":    "test summary 2",
		"video_type": "mp4",
		"status":     "publish",
		"space_id":   1,
	},
}

var analysisData = map[string]interface{}{
	"video_id":          1,
	"rating_id":         1,
	"claim":             "test claim",
	"fact":              "test fact",
	"description":       postgres.Jsonb{RawMessage: []byte(`"test desc"`)},
	"review_sources":    "test sources",
	"start_time":        0,
	"end_time":          200,
	"end_time_fraction": 0.125,
}

var requestData = map[string]interface{}{
	"video": map[string]interface{}{
		"url":        "testvideo.com",
		"title":      "Test Video",
		"summary":    "test summary",
		"video_type": "mp4",
		"status":     "publish",
		"space_id":   1,
	},
	"analysis": []map[string]interface{}{
		{
			"id":                1,
			"video_id":          1,
			"rating_id":         1,
			"claim":             "test claim",
			"fact":              "test fact",
			"description":       "test desc",
			"review_sources":    "test sources",
			"start_time":        0,
			"end_time":          200,
			"end_time_fraction": 0.125,
		},
		{
			"rating_id":         1,
			"video_id":          1,
			"claim":             "test claim 2",
			"fact":              "test fact 2",
			"description":       "test desc 2",
			"review_sources":    "test sources 2",
			"start_time":        200,
			"end_time":          300,
			"end_time_fraction": 0.225,
		},
	},
}

var invalidrequestData = map[string]interface{}{
	"video": map[string]interface{}{
		"ur":         "testvideo.com",
		"summary":    "test summary",
		"video_type": "mp4",
		"space_id":   1,
	},
	"analysis": []map[string]interface{}{
		{
			"id":                1,
			"claim":             "test claim",
			"fact":              "test fact",
			"start_time":        0,
			"end_time":          200,
			"end_time_fraction": 0.125,
		},
	},
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "url", "title", "summary", "video_type", "status", "space_id"}
var analysisColumns = []string{"id", "created_at", "updated_at", "deleted_at", "video_id", "rating_id", "claim", "fact", "description", "review_sources", "end_time", "start_time", "end_time_fraction"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "video"`)
var countQuery string = regexp.QuoteMeta(`SELECT count(1) FROM "video"`)

const path string = "/videos/{video_id}"
const basePath string = "/videos"
const publishedDetailsPath string = "/videos/{video_id}/published"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["url"], Data["title"], Data["summary"], Data["video_type"], Data["status"], Data["space_id"]))
}

func analysisSelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "analysis"`)).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(analysisColumns).
			AddRow(1, time.Now(), time.Now(), nil, analysisData["video_id"], analysisData["rating_id"], analysisData["claim"], analysisData["fact"], analysisData["description"], analysisData["review_sources"], analysisData["end_time"], analysisData["start_time"], analysisData["end_time_fraction"]))
}

func checkResponse(res *httpexpect.Object) {
	res.Value("video").
		Object().
		ContainsMap(Data)

	res.Value("analysis").
		Array().
		Element(0).
		Object().
		ContainsMap(analysisData)
}
