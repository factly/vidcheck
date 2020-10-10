import http from "../../../utilities/http";

import { API_ENDPOINTS } from "./Dashboard.constants";

export function getAllVideosAnalysed() {
  return http.get(API_ENDPOINTS.VIDEO);
}

export function deleteAllVideosAnalysed(id) {
  return http.deleteAPI(API_ENDPOINTS.VIDEO + id);
}
