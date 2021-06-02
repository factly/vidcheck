import { Button, Space } from "antd";
import React from "react";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addClaim } from "../../actions/claims";

import EditClaimForm from "./ClaimForm/Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { index, vid } = useParams();

  const { video, claims } = useSelector(({ videoClaims }) => videoClaims);

  if (!video.url || !claims[index]) {
    history.push(vid ? `/videos/${vid}/edit` : "/videos/create");
  }

  const onUpdate = (values) => {
    dispatch(addClaim({ ...claims[index], ...values }));
    if (video.id) history.push(`/videos/${video.id}/edit`);
    else history.push("/videos/create");
  };

  return (
    <Space direction="vertical">
      <Link to={`/videos/${video.id}/edit`}>
        <Button>Back</Button>
      </Link>
      <EditClaimForm data={claims[index]} onCreate={onUpdate} />
    </Space>
  );
}

export default ClaimForm;
