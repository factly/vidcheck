package space

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

// approve - approve space permission
// @Summary approve space permission
// @Description approve space permission
// @Tags Space_Permissions_Request
// @ID approve-space-permission
// @Consume json
// @Produce json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param request_id path string true "Request ID"
// @Success 201 {object} model.SpacePermission
// @Failure 400 {array} string
// @Router /requests/spaces/{request_id}/approve [post]
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

	request := model.SpacePermissionRequest{}
	request.ID = uint(id)

	// Check if the request exist or not
	err = model.DB.Where(&model.SpacePermissionRequest{
		Request: model.Request{Status: "pending"},
	}).First(&request).Error
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.RecordNotFound()))
		return
	}

	spacePermission := model.SpacePermission{}

	// Check if the permission for the Space already exist
	err = model.DB.Model(&model.SpacePermission{}).Where(&model.SpacePermission{
		SpaceID: request.SpaceID,
	}).First(&spacePermission).Error

	tx := model.DB.WithContext(context.WithValue(r.Context(), permissionContext, uID)).Begin()

	result := model.SpacePermission{
		Base:    model.Base{UpdatedByID: uint(uID)},
		Media:   request.Media,
		Videos:  request.Videos,
		SpaceID: request.SpaceID,
	}

	if err != nil {
		// Create a space permission
		err = tx.Model(&model.SpacePermission{}).Create(&result).Error
	}

	if err != nil {
		tx.Rollback()
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.DBError()))
		return
	}

	// Mark request as approved
	err = tx.Model(&request).Updates(&model.SpacePermissionRequest{
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
