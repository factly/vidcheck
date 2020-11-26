import React, { useState } from "react";
import VideoCreateForm from "./components/VideoAnalysisForm";
import { useDispatch } from "react-redux";
import { addVideo, getVideos } from "../../actions/videos";
import { useHistory } from "react-router-dom";

function CreateVideo() {
  const history = useHistory();
  const [vid, setVid] = useState(0);

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addVideo(values)).then((res) => {
      setVid(res?.video?.id);
      dispatch(getVideos());
    });
  };
  return <VideoCreateForm onSubmit={onCreate} vid={vid} />;
}

export default CreateVideo;
