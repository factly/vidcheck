import React from "react";
import { useHistory } from "react-router-dom";
import { useNetwork } from "../../../react-hooks/network/network";
import { getAllVideosAnalysed } from "./Dashboard.service";
import { transformVideoAnalysisInfo } from "./Dashboard.utilities";
import ApiSuspense from "../../Common/UIComponents/ApiSuspense.component";

function Dashboard() {
  const {
    response: allVideoAnalysisDetails,
    network: networkMeta,
    call: getAllVideoAnalysisDetailsCall,
  } = useNetwork(getAllVideosAnalysed, {
    auto: true,
    transformer: transformVideoAnalysisInfo,
  });

  const history = useHistory();

  const gotoVideoAnalysisDetails = (id) => {
    history.push(`/edit/${id}`);
  };

  return (
    <ApiSuspense meta={networkMeta}>
      {allVideoAnalysisDetails.map((videoAnalysis) => {
        return (
          <>
            <div>{videoAnalysis.url}</div>
            <div>{videoAnalysis.title}</div>
            <div>{videoAnalysis.summary}</div>
            <button onClick={() => gotoVideoAnalysisDetails(videoAnalysis.id)}>
              {videoAnalysis.id}
            </button>
          </>
        );
      })}
    </ApiSuspense>
  );
}

export default Dashboard;
