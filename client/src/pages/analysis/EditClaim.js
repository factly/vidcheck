import { Button, Space } from "antd";
import React from "react";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addClaim } from "../../actions/claims";
import { convertSecondsToTimeString } from "../../utils/analysis";

import EditClaimForm from "./ClaimForm/Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { video, claims } = useSelector(({ videoClaims }) => videoClaims);

  if (!video.url || !claims[id]) {
    history.push("/videos/create");
  }

  const onUpdate = (values) => {
    dispatch(addClaim({ ...claims[id], ...values }));
    if (video.id) history.push(`/videos/${video.id}/edit`);
    else history.push("/videos/create");
  };

  return (
    <Space direction="vertical">
      <Link to={`/videos/${video.id}/edit`}>
        <Button>Back</Button>
      </Link>
      <EditClaimForm data={claims[id]} onCreate={onUpdate} />
    </Space>
  );
}

export default ClaimForm;
