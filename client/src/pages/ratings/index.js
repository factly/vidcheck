import React from "react";
import RatingList from "./components/RatingList";
import { Space, Button, Row } from "antd";
import { Link } from "react-router-dom";

function Ratings() {
  return (
    <Space direction="vertical">
      <Row justify="end">
        <Link key="1" to="/ratings/create">
          <Button type="primary">New Rating</Button>
        </Link>
      </Row>


      <RatingList />
    </Space>
  );
}

export default Ratings;
