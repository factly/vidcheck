import http from "../../../utilities/http";

import { API_ENDPOINTS } from "./CreateUpdateVideoAnalysis.constants";
import { transformToServerCompatibleDate } from "./CreateUpdateVideoAnalysis.utilities";

export function getAllVideoAnalysisDetails(videoId) {
  return http.get(API_ENDPOINTS.VIDEO + videoId);
}

export function createVideoAnalysisDetails(data) {
  return http.post(API_ENDPOINTS.VIDEO, transformToServerCompatibleDate(data));
}

export function updateVideoAnalysisDetails(data, id) {
  return http.put(
    API_ENDPOINTS.VIDEO + id,
    transformToServerCompatibleDate(data)
  );
}
