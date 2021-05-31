import {
  SET_CLAIMS,
  ADD_VIDEO_DATA,
  ADD_CLAIM,
  ADD_CLAIMS,
  DELETE_CLAIM,
} from "../constants/claims";

const initialState = {
  video: {},
  claims: [],
};

export default function claimsReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_CLAIMS:
      return {
        video: {},
        claims: [],
      };
    case ADD_VIDEO_DATA:
      return {
        ...state,
        video: action.payload,
      };
    case ADD_CLAIMS:
      return action.payload;
    case DELETE_CLAIM:
      const start_time = state.claims[action.payload].start_time;
      let claimsFilter = state.claims.filter(
        (each) => each.start_time !== start_time
      );

      return {
        ...state,
        claims: claimsFilter,
      };

    case ADD_CLAIM:
      let claims = state.claims;
      let node = claims.findIndex(
        (each) => each.start_time === action.payload.start_time
      );
      if (node > -1) claims[node] = action.payload;
      else claims.push(action.payload);

      return {
        ...state,
        claims: claims.sort((a, b) => {
          return a.end_time - b.end_time;
        }),
      };
    default:
      return state;
  }
}
