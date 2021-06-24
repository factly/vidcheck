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

const rootReducer = combineReducers({
  admin,
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
});

export default rootReducer;
