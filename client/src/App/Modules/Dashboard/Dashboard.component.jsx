import React from "react";
import { useHistory } from "react-router-dom";
import { useNetwork } from "../../../react-hooks/network/network";
import {
  getAllVideosAnalysed,
  deleteAllVideosAnalysed,
} from "./Dashboard.service";
import { transformVideoAnalysisInfo } from "./Dashboard.utilities";
import ApiSuspense from "../../Common/UIComponents/ApiSuspense.component";
import { Button } from "antd";
import VideoAnalysisCard from "./components/VideoAnalysisCard.component";

function Dashboard() {
  const {
    response: allVideoAnalysisDetails,
    network: networkMeta,
    call: callGetAllVideosAnalysed,
  } = useNetwork(getAllVideosAnalysed, {
    auto: true,
    transformer: transformVideoAnalysisInfo,
  });

  const {
    network: networkMetaDelete,
    call: calldeleteAllVideosAnalysed,
  } = useNetwork(deleteAllVideosAnalysed, {
    transformer: transformVideoAnalysisInfo,
  });

  const deleteVideoAnalysis = async (id) => {
    const [resp, meta] = await calldeleteAllVideosAnalysed(id);
    if (meta.state === "success") {
      callGetAllVideosAnalysed();
    }
  };

  const history = useHistory();

  return (
    <ApiSuspense meta={networkMeta}>
      {allVideoAnalysisDetails.map((videoAnalysis) => {
        return (
            <VideoAnalysisCard videoAnalysisData={videoAnalysis} deleteFunc={deleteVideoAnalysis}/>
        );
      })}
      <Button onClick={() => history.push(`create`)}>New Video Analysis</Button>
    </ApiSuspense>
  );
}

export default Dashboard;
