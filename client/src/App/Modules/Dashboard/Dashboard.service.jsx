import http from "../../../utilities/http";

import { API_ENDPOINTS } from "./Dashboard.constants";

export function getAllVideosAnalysed() {
  return http.get(API_ENDPOINTS.VIDEO);
}
