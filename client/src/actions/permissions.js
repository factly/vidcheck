import axios from "axios";
import {
  PERMISSIONS_API,
  ADD_PERMISSIONS_REQUEST,
  SET_PERMISSIONS_LOADING,
  ADD_PERMISSIONS,
} from "../constants/permissions";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";

export const getPermissions = (id) => {
  return (dispatch) => {
    dispatch(loadingPermissions());
    return axios
      .get(PERMISSIONS_API + id + "/permissions")
      .then((response) => {
        dispatch(addPermission({ data: response.data, user_id: parseInt(id) }));
        dispatch(addRequest([parseInt(id)]));

        return { data: response.data, user_id: parseInt(id) };
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const addPermission = (data) => ({
  type: ADD_PERMISSIONS,
  payload: data,
});

export const addRequest = (data) => ({
  type: ADD_PERMISSIONS_REQUEST,
  payload: data,
});

export const loadingPermissions = () => ({
  type: SET_PERMISSIONS_LOADING,
  payload: true,
});

export const stopLoading = () => ({
  type: SET_PERMISSIONS_LOADING,
  payload: false,
});
