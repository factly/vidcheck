import React from "react";
import {
  Popconfirm,
  Button,
  Typography,
  Table,
  Space,
} from "antd";

import { useDispatch } from "react-redux";
import { deleteClaimant } from "../../../actions/claimants";
import { Link } from "react-router-dom";

function ClaimantList({ data, filters, setFilters, fetchClaimants }) {
  const dispatch = useDispatch();

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Tag Line",
      dataIndex: "tag_line",
      key: "tag_line",
      width: "20%",
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>
            {record.tag_line}
          </Typography.Paragraph>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/claimants/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() =>
                dispatch(deleteClaimant(record.id)).then(() => fetchClaimants())
              }
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Space direction={"vertical"}>
      <Table
        bordered
        columns={columns}
        dataSource={data.claimants}
        loading={data.loading}
        rowKey={"id"}
        pagination={{
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default ClaimantList;
