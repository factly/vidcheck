package organisation

import (
	"context"
	"net/http"
	"strconv"

	"github.com/factly/vidcheck/model"
	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/middlewarex"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// approve - approve organisation permission
// @Summary approve organisation permission
// @Description approve organisation permission
// @Tags Organisation_Permissions_Request
// @ID approve-org-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param request_id path string true "Request ID"
// @Success 201 {object} model.OrganisationPermission
// @Failure 400 {array} string
// @Router /requests/organisations/{request_id}/approve [post]
func approve(w http.ResponseWriter, r *http.Request) {

	uID, err := middlewarex.GetUser(r.Context())
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.Unauthorized()))
		return
	}

	requestID := chi.URLParam(r, "request_id")
	id, err := strconv.Atoi(requestID)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InvalidID()))
		return
	}

	request := model.OrganisationPermissionRequest{}
	request.ID = uint(id)

	// Check if the request exist or not
	err = model.DB.Where(&model.OrganisationPermissionRequest{
		Request: model.Request{Status: "pending"},
	}).First(&request).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	orgPermission := model.OrganisationPermission{}

	// Check if the permission for the organisation already exist
	err = model.DB.Model(&model.OrganisationPermission{}).Where(&model.OrganisationPermission{
		OrganisationID: request.OrganisationID,
	}).First(&orgPermission).Error

	tx := model.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Begin()

	result := model.OrganisationPermission{
		Base:           model.Base{UpdatedByID: uint(uID)},
		OrganisationID: request.OrganisationID,
		Spaces:         request.Spaces,
	}

	if err != nil {
		// Create a organisation permission
		err = tx.Model(&model.OrganisationPermission{}).Create(&result).Error
	} else {
		// Update the organisation permission
		err = tx.Model(&orgPermission).Updates(&result).First(&result).Error
	}

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Mark request as approved
	err = tx.Model(&request).Updates(&model.OrganisationPermissionRequest{
		Request: model.Request{
			Base:   model.Base{UpdatedByID: uint(uID)},
			Status: "approved",
		},
	}).Error
	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	tx.Commit()
	renderx.JSON(w, http.StatusOK, result)
}
