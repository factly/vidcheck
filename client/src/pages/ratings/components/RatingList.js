import React from "react";
import { Popconfirm, Button, Typography, Table, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  getRatings,
  deleteRating,
  addDefaultRatings,
} from "../../../actions/ratings";
import { Link } from "react-router-dom";
import deepEqual from "deep-equal";

function RatingList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 10,
  });

  const { ratings, total, loading } = useSelector((state) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        total: node.total,
        loading: state.ratings.loading,
      };
    return { ratings: [], total: 0, loading: state.ratings.loading };
  });

  React.useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dispatch]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "40%",
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>
            {record.description}
          </Typography.Paragraph>
        );
      },
    },
    { title: "Rating Value", dataIndex: "numeric_value", key: "numeric_value" },
    {
      title: "Colour",
      dataIndex: "colour",
      key: "colour",
      width: "10%",
      render: (_, record) => {
        return record.colour && record.colour.hex ? (
          <Tag color={record.colour.hex}>{record.colour.hex}</Tag>
        ) : null;
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
              to={`/ratings/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() =>
                dispatch(deleteRating(record.id)).then(() => fetchRatings())
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
    <>
      {ratings.length === 0 ? (
        <Button
          onClick={() => {
            dispatch(addDefaultRatings()).then(() =>
              dispatch(getRatings(filters))
            );
          }}
        >
          <PlusOutlined /> Create Ratings
        </Button>
      ) : null}
      <Table
        bordered
        columns={columns}
        dataSource={ratings}
        loading={loading}
        rowKey={"id"}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ page: pageNumber, limit: pageSize }),
        }}
      />
    </>
  );
}

export default RatingList;
