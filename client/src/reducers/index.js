import { combineReducers } from "redux";
import notifications from "./notificationsReducer";
import ratings from "./ratingsReducer";
import settings from "./settingsReducer";
import spaces from "./spacesReducer";
import videos from "./videosReducer";
import claimants from "./claimantsReducer";
import videoClaims from "./claimsReducer";
import media from "./mediumReducer";

const rootReducer = combineReducers({
  videoClaims,
  notifications,
  ratings,
  claimants,
  settings,
  spaces,
  videos,
  media,
});

export default rootReducer;
