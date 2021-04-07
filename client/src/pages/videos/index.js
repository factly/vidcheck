import React from "react";
import { Button, Space } from "antd";
import { Link } from "react-router-dom";
import VideoList from "./components/VideoList";

function Dashboard() {
  return (
    <Space direction="vertical">
      <Link to="/analysis/create">
        <Button>Create New</Button>
      </Link>
      <VideoList />
    </Space>
  );
}

export default Dashboard;
