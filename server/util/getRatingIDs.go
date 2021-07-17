package util

import "github.com/factly/vidcheck/model"

func GetRatingAndClaimantIDs(claims []model.ClaimData) ([]uint, []uint) {

	ratingIDs := make([]uint, 0)
	claimantIDs := make([]uint, 0)

	for _, each := range claims {
		ratingIDs = append(ratingIDs, each.RatingID)
		claimantIDs = append(claimantIDs, each.ClaimantID)
	}

	return ratingIDs, claimantIDs
}
