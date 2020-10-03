import http from "../../../utilities/http";

import { API_ENDPOINTS } from "./CreateUpdateVideoAnalysis.constants";

export function getAllVideoAnalysisDetails(videoId) {
    return http.get(API_ENDPOINTS.VIDEO + videoId);
}