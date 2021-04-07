import axios from "axios";
import {
  ADD_VIDEO,
  ADD_VIDEOS,
  ADD_VIDEOS_REQUEST,
  SET_VIDEOS_LOADING,
  RESET_VIDEOS,
  VIDEOS_API,
} from "../constants/videos";
import { addErrorNotification, addSuccessNotification } from "./notifications";

export const getVideos = (query) => {
  return (dispatch) => {
    dispatch(loadingVideos());
    return axios
      .get(VIDEOS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addVideosList(response.data.nodes));
        dispatch(
          addVideosRequest({
            data: response.data.nodes.map((item) => item.video.id),
            query: query,
            total: response.data.total,
          })
        );
        dispatch(stopVideosLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getVideo = (id) => {
  return (dispatch) => {
    dispatch(loadingVideos());
    return axios
      .get(VIDEOS_API + "/" + id)
      .then((response) => {
        dispatch(getVideoByID(response.data));
        dispatch(stopVideosLoading());

        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addVideo = (data) => {
  return (dispatch) => {
    dispatch(loadingVideos());
    return axios
      .post(VIDEOS_API, data)
      .then((res) => {
        dispatch(resetVideos());
        dispatch(addSuccessNotification("Video added"));
        return res.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateVideo = (data) => {
  return (dispatch) => {
    dispatch(loadingVideos());
    return axios
      .put(VIDEOS_API + "/" + data.video.id, data)
      .then((response) => {
        dispatch(getVideoByID(response.data));
        dispatch(stopVideosLoading());
        dispatch(addSuccessNotification("Video updated"));
        return response.data;
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteVideo = (id) => {
  return (dispatch) => {
    dispatch(loadingVideos());
    return axios
      .delete(VIDEOS_API + "/" + id)
      .then(() => {
        dispatch(resetVideos());
        dispatch(addSuccessNotification("Video deleted"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addVideos = (videos) => {
  return (dispatch) => {
    dispatch(addVideosList(videos));
  };
};

export const loadingVideos = () => ({
  type: SET_VIDEOS_LOADING,
  payload: true,
});

export const stopVideosLoading = () => ({
  type: SET_VIDEOS_LOADING,
  payload: false,
});

export const getVideoByID = (data) => ({
  type: ADD_VIDEO,
  payload: data,
});

export const addVideosList = (data) => ({
  type: ADD_VIDEOS,
  payload: data,
});

export const addVideosRequest = (data) => ({
  type: ADD_VIDEOS_REQUEST,
  payload: data,
});

export const resetVideos = () => ({
  type: RESET_VIDEOS,
});
