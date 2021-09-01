import React from "react";
import OrganisationRequestList from "./components/RequestList";
import { Space, Button, Row } from "antd";
import { Link } from "react-router-dom";

function OrganisationRequests() {
  return (
    <Space direction="vertical">
      <Row justify="end">
        <Link key="1" to="/requests/organisations/create">
          <Button type="primary">New Request</Button>
        </Link>
      </Row>

      <OrganisationRequestList />
    </Space>
  );
}

export default OrganisationRequests;
