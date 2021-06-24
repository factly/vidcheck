package model

// Organisation model
type Organisation struct {
	Base
	Title            string  `json:"title"`
	Slug             string  `json:"slug"`
	Description      string  `json:"description"`
	FeaturedMediumID *uint   `json:"featured_medium_id"`
	Medium           *Medium `json:"medium"`
}
