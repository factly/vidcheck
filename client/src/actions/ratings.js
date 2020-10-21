import axios from "axios";
import {
  ADD_RATING,
  ADD_RATINGS,
  ADD_RATINGS_REQUEST,
  SET_RATINGS_LOADING,
  RESET_RATINGS,
  RATINGS_API,
} from "../constants/ratings";
import { addErrorNotification, addSuccessNotification } from "./notifications";

export const addDefaultRatings = (query) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API + "/default")
      .then((response) => {
        dispatch(
          addRatingsList(
            response.data.nodes.map((rating) => {
              return { ...rating, medium: rating.medium?.id };
            })
          )
        );
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getRatings = (query) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addRatingsList(
            response.data.nodes.map((rating) => {
              return { ...rating, medium: rating.medium?.id };
            })
          )
        );
        dispatch(
          addRatingsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .get(RATINGS_API + "/" + id)
      .then((response) => {
        dispatch(
          getRatingByID({ ...response.data, medium: response.data.medium?.id })
        );
        dispatch(stopRatingsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .post(RATINGS_API, data)
      .then(() => {
        dispatch(resetRatings());
        dispatch(addSuccessNotification("Rating added"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateRating = (data) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .put(RATINGS_API + "/" + data.id, data)
      .then((response) => {
        const rating = response.data;

        dispatch(getRatingByID({ ...rating, medium: rating.medium?.id }));
        dispatch(stopRatingsLoading());
        dispatch(addSuccessNotification("Rating updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteRating = (id) => {
  return (dispatch) => {
    dispatch(loadingRatings());
    return axios
      .delete(RATINGS_API + "/" + id)
      .then(() => {
        dispatch(resetRatings());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addRatings = (ratings) => {
  return (dispatch) => {
    dispatch(
      addRatingsList(
        ratings.map((rating) => {
          return { ...rating };
        })
      )
    );
  };
};

export const loadingRatings = () => ({
  type: SET_RATINGS_LOADING,
  payload: true,
});

export const stopRatingsLoading = () => ({
  type: SET_RATINGS_LOADING,
  payload: false,
});

export const getRatingByID = (data) => ({
  type: ADD_RATING,
  payload: data,
});

export const addRatingsList = (data) => ({
  type: ADD_RATINGS,
  payload: data,
});

export const addRatingsRequest = (data) => ({
  type: ADD_RATINGS_REQUEST,
  payload: data,
});

export const resetRatings = () => ({
  type: RESET_RATINGS,
});
