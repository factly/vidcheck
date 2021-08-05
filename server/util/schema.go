package util

import (
	"time"

	"github.com/factly/vidcheck/model"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Author of Factcheck
type Author struct {
	Name string `json:"name"`
	Type string `json:"@type"`
	URL  string `json:"url"`
}

// ItemReviewed type
type ItemReviewed struct {
	Type          string         `json:"@type"`
	DatePublished time.Time      `json:"datePublished"`
	Appearance    postgres.Jsonb `json:"appearance"`
	Author        Author         `json:"author"`
}

// ReviewRating type
type ReviewRating struct {
	Type               string `json:"@type"`
	RatingValue        int    `json:"ratingValue"`
	BestRating         int    `json:"bestRating"`
	WorstRating        int    `json:"worstRating"`
	AlternateName      string `json:"alternateName"`
	RatingExplaination string `json:"ratingExplaination"`
}

// FactCheckSchema for factcheck
type FactCheckSchema struct {
	Context       string       `json:"@context"`
	Type          string       `json:"@type"`
	DatePublished time.Time    `json:"datePublished"`
	URL           string       `json:"url"`
	ClaimReviewed string       `json:"claimReviewed"`
	Author        Author       `json:"author"`
	ReviewRating  ReviewRating `json:"reviewRating"`
	ItemReviewed  ItemReviewed `json:"itemReviewed"`
}

func GetFactCheckSchema(claims []model.Claim, createdAt time.Time, slug string, space model.Space) []FactCheckSchema {
	result := make([]FactCheckSchema, 0)

	bestRating := 5
	worstRating := 1

	for _, each := range claims {
		claimSchema := FactCheckSchema{}
		claimSchema.Context = "https://schema.org"
		claimSchema.Type = "ClaimReview"
		claimSchema.DatePublished = createdAt
		claimSchema.URL = space.SiteAddress + "/" + slug
		claimSchema.ClaimReviewed = each.Claim
		claimSchema.Author.Type = "Organization"
		claimSchema.Author.Name = space.Name
		claimSchema.Author.URL = space.SiteAddress
		claimSchema.ReviewRating.Type = "Rating"
		claimSchema.ReviewRating.RatingValue = each.Rating.NumericValue
		claimSchema.ReviewRating.AlternateName = each.Rating.Name
		claimSchema.ReviewRating.BestRating = bestRating
		claimSchema.ReviewRating.RatingExplaination = each.Fact
		claimSchema.ReviewRating.WorstRating = worstRating
		claimSchema.ItemReviewed.Type = "Claim"
		if each.CheckedDate != nil {
			claimSchema.ItemReviewed.DatePublished = *each.CheckedDate
		}
		claimSchema.ItemReviewed.Appearance = each.ClaimSources
		claimSchema.ItemReviewed.Author.Type = "Organization"
		claimSchema.ItemReviewed.Author.Name = each.Claimant.Name

		result = append(result, claimSchema)
	}
	return result
}
