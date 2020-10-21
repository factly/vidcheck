import {
  ADD_VIDEO,
  ADD_VIDEOS,
  ADD_VIDEOS_REQUEST,
  SET_VIDEOS_LOADING,
  RESET_VIDEOS,
} from "../constants/videos";
import deepEqual from "deep-equal";

const initialState = {
  req: [],
  details: {},
  loading: true,
};

export default function videosReducer(state = initialState, action = {}) {
  switch (action.type) {
    case RESET_VIDEOS:
      return {
        ...state,
        req: [],
        details: {},
        loading: true,
      };
    case SET_VIDEOS_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ADD_VIDEOS_REQUEST:
      return {
        ...state,
        req: state.req
          .filter((value) => !deepEqual(value.query, action.payload.query))
          .concat(action.payload),
      };
    case ADD_VIDEOS:
      if (action.payload.length === 0) {
        return state;
      }
      return {
        ...state,
        details: {
          ...state.details,
          ...action.payload.reduce(
            (obj, item) => Object.assign(obj, { [item.video.id]: item }),
            {}
          ),
        },
      };
    case ADD_VIDEO:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.video.id]: action.payload,
        },
      };
    default:
      return state;
  }
}
