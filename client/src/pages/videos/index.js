import React from "react";
import { Button, Space } from "antd";
import { Link } from "react-router-dom";
import VideoList from "./components/VideoList";
import { useDispatch } from "react-redux";
import { resetClaim } from "../../actions/claims";

function Dashboard() {
  const dispatch = useDispatch();
  return (
    <Space direction="vertical">
      <Link to="/videos/create">
        <Button onClick={() => dispatch(resetClaim())}>Create New</Button>
      </Link>
      <VideoList />
    </Space>
  );
}

export default Dashboard;
