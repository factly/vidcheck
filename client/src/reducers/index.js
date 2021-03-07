import { combineReducers } from "redux";
import notifications from "./notificationsReducer";
import ratings from "./ratingsReducer";
import settings from "./settingsReducer";
import spaces from "./spacesReducer";
import videos from "./videosReducer";
import claimants from "./claimantsReducer";

const rootReducer = combineReducers({
  notifications,
  ratings,
  claimants,
  settings,
  spaces,
  videos,
});

export default rootReducer;
