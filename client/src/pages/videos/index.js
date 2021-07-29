import React from "react";
import { Space, Button, Row, Col, Form, Input, Select } from "antd";
import { Link } from "react-router-dom";
import VideoList from "./components/VideoList";
import { useDispatch, useSelector } from "react-redux";
import { deleteVideo, getVideos } from "../../actions/videos";
import deepEqual from "deep-equal";

function Videos({ permission }) {
  const dispatch = useDispatch();
  const { actions } = permission;
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  React.useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dispatch]);

  const fetchVideos = () => {
    dispatch(getVideos(filters));
  };

  const { videos, loading, total } = useSelector(({ videos }) => {
    const node = videos.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        videos: node.data.map((element) => videos.details[element]),
        total: node.total,
        loading: videos.loading,
      };
    return { videos: [], total: 0, loading: videos.loading };
  });

  const onDeleteVideo = (id) => {
    dispatch(deleteVideo(id)).then(() => dispatch(getVideos(filters)));
  };

  const onSave = (values) => {
    let filterValue = {
      sort: values.sort,
      q: values.q,
    };

    setFilters({ ...filters, ...filterValue });
  };
  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        onFinish={(values) => onSave(values)}
        style={{ maxWidth: "100%" }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            onSave(allValues);
          }
        }}
      >
        <Row gutter={24}>
          <Col key={1} span={5}>
            <Link to="/fact-checks/create">
              <Button
                disabled={
                  !(actions.includes("admin") || actions.includes("create"))
                }
              >
                Create New
              </Button>
            </Link>
          </Col>
          <Col key={2} span={9} offset={10}>
            <Space direction="horizontal">
              <Form.Item name="q">
                <Input placeholder="search fact check" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit">Search</Button>
              </Form.Item>
              <Form.Item name="sort" label="Sort" style={{ width: "100%" }}>
                <Select defaultValue="desc">
                  <Option value="desc">Latest</Option>
                  <Option value="asc">Old</Option>
                </Select>
              </Form.Item>
            </Space>
          </Col>
        </Row>
      </Form>
      <VideoList
        videos={videos}
        loading={loading}
        total={total}
        filters={filters}
        setFilters={setFilters}
        onDeleteVideo={onDeleteVideo}
      />
    </Space>
  );
}

export default Videos;
