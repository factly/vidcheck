import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addClaim } from "../../actions/analysis";
import { convertSecondsToTimeString } from "../../utils/analysis";

import EditClaimForm from "./ClaimForm/Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { video, claims } = useSelector(({ analysis }) => analysis);

  if (!video.url || !claims[id]) {
    history.push("/analysis/create");
  }

  const onUpdate = (values) => {
    dispatch(addClaim(values));
    history.push("/analysis/create");
  };

  return (
    <EditClaimForm
      data={claims[id]}
      onCreate={onUpdate}
      startTime={
        claims.length > 0
          ? convertSecondsToTimeString(claims[claims.length - 1].end_time)
          : "00:00"
      }
    />
  );
}

export default ClaimForm;
