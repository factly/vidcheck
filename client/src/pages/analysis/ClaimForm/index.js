import { Button, Space } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { addClaim } from "../../../actions/claims";
import { Link } from "react-router-dom";

import CreateClaimForm from "./Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { video } = useSelector(({ videoClaims }) => videoClaims);

  if (!video.url) {
    history.push("/videos/create");
  }

  const onCreate = (values) => {
    dispatch(addClaim(values));
    if (video.id > 0) history.push(`/videos/${video.id}/edit`);
    else history.push("/videos/create");
  };

  return (
    <Space direction="vertical">
      <Link to={video.id > 0 ? `/videos/${video.id}/edit` : "/videos/create"}>
        <Button>Back</Button>
      </Link>
      <CreateClaimForm onCreate={onCreate} video={video} />
    </Space>
  );
}

export default ClaimForm;
