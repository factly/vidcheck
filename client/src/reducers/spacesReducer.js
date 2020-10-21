import {
  SET_SELECTED_SPACE,
  GET_SPACES_SUCCESS,
  ADD_SPACE_SUCCESS,
  LOADING_SPACES,
  DELETE_SPACE_SUCCESS,
  UPDATE_SPACE_SUCCESS,
} from "../constants/spaces";

const initialState = {
  orgs: [],
  details: {},
  loading: true,
  selected: 0,
};

export default function spacesReducer(state = initialState, action = {}) {
  if (!action.payload) {
    return state;
  }
  switch (action.type) {
    case LOADING_SPACES:
      return {
        ...state,
        loading: true,
      };
    case GET_SPACES_SUCCESS:
      let space_details = {};

      action.payload.forEach((element) => {
        element.spaces.forEach((s) => {
          space_details[s.id] = s;
        });
      });

      const defaultSpace =
        Object.keys(space_details).length > 0
          ? space_details[Object.keys(space_details)[0]].id
          : 0;

      return {
        ...state,
        orgs: action.payload.map((each) => {
          return { ...each, spaces: each.spaces.map((e) => e.id) };
        }),
        details: space_details,
        loading: false,
        selected: space_details[state.selected] ? state.selected : defaultSpace,
      };
    case ADD_SPACE_SUCCESS:
      let org_index = state.orgs.findIndex(
        (element) => element.id === action.payload.organisation_id
      );
      let space_list = [...state.orgs[org_index].spaces];
      space_list.splice(0, 0, action.payload.id);
      let org_copy = [...state.orgs];
      org_copy[org_index] = {
        ...org_copy[org_index],
        spaces: space_list,
      };
      return {
        ...state,
        loading: false,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
        orgs: org_copy,
        selected: action.payload.id,
      };
    case SET_SELECTED_SPACE:
      return {
        ...state,
        selected: action.payload,
      };
    case UPDATE_SPACE_SUCCESS:
      return {
        ...state,
        details: {
          ...state.details,
          [action.payload.id]: action.payload,
        },
      };
    case DELETE_SPACE_SUCCESS:
      return initialState;
    default:
      return state;
  }
}
