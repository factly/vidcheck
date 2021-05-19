import { Button, Space } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { addClaim } from "../../../actions/analysis";
import { Link } from "react-router-dom";

import CreateClaimForm from "./Claim";

function ClaimForm() {
  const history = useHistory();
  const dispatch = useDispatch();

  const { video } = useSelector(({ analysis }) => analysis);

  if (!video.url) {
    history.push("/analysis/create");
  }

  const onCreate = (values) => {
    dispatch(addClaim(values));
    if (video.id > 0) history.push(`/analysis/${video.id}/edit`);
    else history.push("/analysis/create");
  };

  return (
    <Space direction="vertical">
      <Link
        to={video.id > 0 ? `/analysis/${video.id}/edit` : "/analysis/create"}
      >
        <Button>Back</Button>
      </Link>
      <CreateClaimForm onCreate={onCreate} video={video} />
    </Space>
  );
}

export default ClaimForm;
