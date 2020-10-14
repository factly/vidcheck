package model

type organisationUser struct {
	Base
	Role string `json:"role"`
}

// Organisation model
type Organisation struct {
	Base
	Title      string           `json:"title"`
	Slug       string           `json:"slug"`
	Permission organisationUser `json:"permission"`
}
