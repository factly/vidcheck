package test

import (
	"net/http"
	"time"

	"github.com/spf13/viper"
	"gopkg.in/h2non/gock.v1"
)

var DummyOwner_Org = map[string]interface{}{
	"id":         1,
	"created_at": time.Now(),
	"updated_at": time.Now(),
	"deleted_at": nil,
	"title":      "test org",
	"permission": map[string]interface{}{
		"id":              1,
		"created_at":      time.Now(),
		"updated_at":      time.Now(),
		"deleted_at":      nil,
		"user_id":         1,
		"user":            nil,
		"organisation_id": 1,
		"organisation":    nil,
		"role":            "owner",
	},
}

var DummyMember_Org = map[string]interface{}{
	"id":         2,
	"created_at": time.Now(),
	"updated_at": time.Now(),
	"deleted_at": nil,
	"title":      "test org 2",
	"permission": map[string]interface{}{
		"id":              1,
		"created_at":      time.Now(),
		"updated_at":      time.Now(),
		"deleted_at":      nil,
		"user_id":         1,
		"user":            nil,
		"organisation_id": 1,
		"organisation":    nil,
		"role":            "member",
	},
}

var Dummy_OrgList = []map[string]interface{}{
	DummyOwner_Org,
	DummyMember_Org,
}

func KavachGock() {
	gock.New(viper.GetString("kavach.url") + "/organisations/my").
		Persist().
		Reply(http.StatusOK).
		JSON(Dummy_OrgList)
}

var Dummy_RatingList = []map[string]interface{}{
	{
		"id":            1,
		"created_at":    time.Now(),
		"updated_at":    time.Now(),
		"deleted_at":    nil,
		"name":          "Partly False",
		"slug":          "partly-false",
		"description":   "Partly False",
		"numeric_value": 2,
		"space_id":      1,
	},
	AnotherRating,
}

var AnotherRating = map[string]interface{}{
	"id":            2,
	"created_at":    time.Now(),
	"updated_at":    time.Now(),
	"deleted_at":    nil,
	"name":          "False",
	"slug":          "false",
	"description":   "False",
	"numeric_value": 1,
	"space_id":      1,
}

func DegaGock() {
	paiganationResponse := map[string]interface{}{
		"total": len(Dummy_RatingList),
		"nodes": Dummy_RatingList,
	}

	gock.New(viper.GetString("dega.url")).
		Get("/fact-check/ratings").
		MatchParam("all", "true").
		Persist().
		Reply(http.StatusOK).
		JSON(paiganationResponse)

	DegaSpaceGock()
}

func DegaSpaceGock() {
	DummyOwner_Org["spaces"] = []map[string]interface{}{
		{
			"id":                 1,
			"created_at":         time.Now(),
			"updated_at":         time.Now(),
			"deleted_at":         nil,
			"name":               "Test Space",
			"slug":               "test-space",
			"site_title":         "none",
			"tag_line":           "none",
			"description":        "This is test space",
			"site_address":       "none",
			"verification_codes": "none",
			"social_media_urls":  "none",
			"contact_info":       "none",
			"organisation_id":    1,
		},
	}

	var orgWithSpaces = []map[string]interface{}{
		DummyOwner_Org,
	}

	gock.New(viper.GetString("dega.url")).
		Get("/core/spaces").
		Persist().
		Reply(http.StatusOK).
		JSON(orgWithSpaces)
}
