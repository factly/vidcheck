import React from "react";
import VideoCreateForm from "./components/VideoAnalysisForm";
import { useDispatch } from "react-redux";
import { addVideo } from "../../actions/videos";
import { useHistory } from "react-router-dom";

function CreateVideo() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addVideo(values)).then(() => history.push("/"));
  };
  return <VideoCreateForm onSubmit={onCreate} />;
}

export default CreateVideo;
