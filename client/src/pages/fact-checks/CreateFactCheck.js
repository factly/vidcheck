import React from "react";
import FactCheckCreateForm from "./components/Form/index";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { addVideo } from "../../actions/videos";
import { resetClaim } from "../../actions/claims";

function CreateFactCheck() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addVideo(values)).then((res) => {
      if (res?.video?.id) {
        dispatch(resetClaim());
        history.push(`/fact-checks/${res.video.id}/preview`);
      }
    });
  };
  return <FactCheckCreateForm onSubmit={onCreate} />;
}

export default CreateFactCheck;
