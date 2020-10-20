package space

import (
	"database/sql/driver"
	"encoding/json"
	"regexp"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm/dialects/postgres"
)

func nilJsonb() postgres.Jsonb {
	ba, _ := json.Marshal(nil)
	return postgres.Jsonb{
		RawMessage: ba,
	}
}

var Data map[string]interface{} = map[string]interface{}{
	"name":               "Test Space",
	"slug":               "test-space",
	"site_title":         "Test site title",
	"tag_line":           "Test tagline",
	"description":        "Test Description",
	"site_address":       "testaddress.com",
	"verification_codes": nilJsonb(),
	"social_media_urls":  nilJsonb(),
	"contact_info":       nilJsonb(),
	"organisation_id":    1,
}

var invalidData map[string]interface{} = map[string]interface{}{
	"nam":             "Te",
	"slug":            "test-space",
	"organisation_id": 0,
}

var Columns = []string{"id", "created_at", "updated_at", "deleted_at", "name", "slug", "site_title", "tag_line", "description", "site_address", "verification_codes", "social_media_urls", "contact_info", "organisation_id"}

var selectQuery string = regexp.QuoteMeta(`SELECT * FROM "space"`)
var deleteQuery string = regexp.QuoteMeta(`UPDATE "space" SET "deleted_at"=`)

const path string = "/spaces/{space_id}"
const basePath string = "/spaces"

func SelectQuery(mock sqlmock.Sqlmock, args ...driver.Value) {
	mock.ExpectQuery(selectQuery).
		WithArgs(args...).
		WillReturnRows(sqlmock.NewRows(Columns).
			AddRow(1, time.Now(), time.Now(), nil, Data["name"], Data["slug"], Data["site_title"], Data["tag_line"], Data["description"], Data["site_address"], Data["verification_codes"], Data["social_media_urls"], Data["contact_info"], Data["organisation_id"]))
}
