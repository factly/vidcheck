import React from "react";
import AnalysisCreateForm from "./index";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { addVideo } from "../../actions/videos";

function CreateAnalysis() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addVideo(values)).then((res) => {
      console.log({ res });
      history.push(`/preview/${res.video.id}`);
    });
  };
  return <AnalysisCreateForm onSubmit={onCreate} />;
}

export default CreateAnalysis;
