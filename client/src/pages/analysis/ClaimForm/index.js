import { Skeleton } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { addClaim } from "../../../actions/analysis";
import { convertSecondsToTimeString } from "../../../utils/analysis";

import CreateClaimForm from "./Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { video, claims } = useSelector(({ analysis }) => analysis);

  if (!video.url) {
    history.push("/analysis/create");
  }

  const onCreate = (values) => {
    dispatch(addClaim(values));
    if (video.id > 0) history.push(`/analysis/${video.id}/edit`);
    else history.push("/analysis/create");
  };

  return (
    <CreateClaimForm
      onCreate={onCreate}
      startTime={
        claims.length > 0
          ? convertSecondsToTimeString(claims[claims.length - 1].end_time)
          : "00:00"
      }
    />
  );
}

export default ClaimForm;
