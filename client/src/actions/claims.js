import {
  ADD_CLAIM,
  DELETE_CLAIM,
  ADD_VIDEO_DATA,
  ADD_CLAIMS,
  SET_CLAIMS,
} from "../constants/claims";

export const addClaim = (data) => ({
  type: ADD_CLAIM,
  payload: data,
});

export const resetClaim = () => ({
  type: SET_CLAIMS,
});

export const addClaims = (data) => {
  const claims = data.claims.map((each) => ({
    ...each,
    colour: each.rating.background_colour.hex,
    slug: each.rating.slug,
  }));
  return {
    type: ADD_CLAIMS,
    payload: { video: data.video, claims },
  };
};

export const addVideo = (data) => ({
  type: ADD_VIDEO_DATA,
  payload: data,
});

export const deleteVideo = (index) => ({
  type: DELETE_CLAIM,
  payload: index,
});
