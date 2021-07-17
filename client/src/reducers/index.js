import { combineReducers } from "redux";
import notifications from "./notificationsReducer";
import ratings from "./ratingsReducer";
import settings from "./settingsReducer";
import spaces from "./spacesReducer";
import videos from "./videosReducer";
import claimants from "./claimantsReducer";
import videoClaims from "./claimsReducer";
import media from "./mediumReducer";
import organisationPermissions from "./organisationPermissionReducer";
import spacePermissions from "./spacePermissionReducer";
import organisationRequests from "./organisationRequestReducer";
import spaceRequests from "./spaceRequestReducer";
import admin from "./adminReducer";
import policies from "./policiesReducer";
import authors from "./authorsReducer";
import sidebar from "./sidebarReducer";
import users from "./userReducer";
import permissions from "./permissionsReducer";
import categories from "./categoriesReducer";
import tags from "./tagsReducer";

const rootReducer = combineReducers({
  admin,
  categories,
  sidebar,
  authors,
  permissions,
  videoClaims,
  notifications,
  ratings,
  claimants,
  settings,
  spaces,
  videos,
  media,
  organisationPermissions,
  spacePermissions,
  organisationRequests,
  spaceRequests,
  policies,
  users,
  tags,
});

export default rootReducer;
