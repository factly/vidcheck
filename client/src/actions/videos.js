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
import { addCategories } from './categories';
import { addAuthors } from './authors';
import { addTags } from './tags';

export const getVideos = (query = {}) => {
  return (dispatch) => {
    dispatch(loadingVideos());

    const params = new URLSearchParams();
    if (query.category && query.category.length > 0) {
      query.category.map((each) => params.append('category', each));
    }
    if (query.tag && query.tag.length > 0) {
      query.tag.map((each) => params.append('tag', each));
    }
    if (query.page) {
      params.append('page', query.page);
    }
    if (query.limit) {
      params.append('limit', query.limit);
    }
    if (query.sort) {
      params.append('sort', query.sort);
    }
    if (query.q) {
      params.append('q', query.q);
    }
    if (query.status) {
      params.append('status', query.status);
    }


    return axios
      .get(VIDEOS_API, {
        params: params,
      })
      .then((response) => {
        dispatch(
          addAuthors(
            response.data.nodes
              .filter((data) => data.video.authors.length > 0)
              .map((data) => {
                return data.video.authors;
              })
              .flat(1),
          ),
        );
        dispatch(
          addTags(
            response.data.nodes
              .filter((data) => data.video.tags.length > 0)
              .map((data) => {
                return data.video.tags;
              })
              .flat(1),
          ),
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((data) => data.video.categories.length > 0)
              .map((data) => {
                return data.video.categories;
              })
              .flat(1),
          ),
        );
        dispatch(
          addVideosList(
            response.data.nodes.map((each) => {
              return {
                video: {
                  ...each.video,
                  categories: each.video.categories.map((category) => category.id),
                  tags: each.video.tags.map((tag) => tag.id),
                  authors: each.video.authors.map((author) => author.id),
                },
                claims: each.claims
              };
            }),
          ),
        );

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
        let data = response.data;
        dispatch(addTags(data.video.tags));
        dispatch(addAuthors(data.video.authors));
        dispatch(addCategories(data.video.categories));
        const videoObj = {
          video: {
            ...data.video,
            categories: data.video.categories.map((category) => category.id),
            tags: data.video.tags.map((tag) => tag.id),
            authors: data.video.authors.map((author) => author.id),
          },
          claims: data.claims
        }
        dispatch(getVideoByID(videoObj));
        dispatch(stopVideosLoading());

        return videoObj;
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
        let data = response.data;
        dispatch(addTags(data.video.tags));
        dispatch(addAuthors(data.video.authors));
        dispatch(addCategories(data.video.categories));
        dispatch(getVideoByID({
          video: {
            ...data.video,
            categories: data.video.categories.map((category) => category.id),
            tags: data.video.tags.map((tag) => tag.id),
            authors: data.video.authors.map((author) => author.id),
          },
          claims: data.claims
        }));
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
