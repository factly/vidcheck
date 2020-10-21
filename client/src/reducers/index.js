import { combineReducers } from "redux";
import notifications from "./notificationsReducer";
import ratings from "./ratingsReducer";
import settings from "./settingsReducer";
import spaces from "./spacesReducer";
import videos from "./videosReducer";

const rootReducer = combineReducers({
  notifications: notifications,
  ratings: ratings,
  settings: settings,
  spaces: spaces,
  videos: videos,
});

export default rootReducer;
