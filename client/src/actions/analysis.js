import {
  ADD_CLAIM,
  DELETE_CLAIM,
  ADD_VIDEO_DATA,
  ADD_ANALYSIS,
  SET_ANALYSIS,
} from "../constants/analysis";

export const addClaim = (data) => ({
  type: ADD_CLAIM,
  payload: data,
});

export const resetClaim = () => ({
  type: SET_ANALYSIS,
});

export const addAnalysis = (data) => {
  const claims = data.claims.map((each) => ({
    ...each,
    colour: each.rating.colour.hex,
    slug: each.rating.slug,
  }));
  return {
    type: ADD_ANALYSIS,
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
