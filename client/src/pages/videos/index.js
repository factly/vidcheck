import React from "react";
import { Space, Button, Row, Col, Form, Input, Select } from "antd";
import { Link } from "react-router-dom";
import VideoList from "./components/VideoList";
import { useDispatch, useSelector } from "react-redux";
import { deleteVideo, getVideos } from "../../actions/videos";
import deepEqual from "deep-equal";
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import Selector from '../../components/Selector/index';

function Videos({ permission }) {
  const dispatch = useDispatch();
  const { actions } = permission;
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const [expand, setExpand] = React.useState(false);
  const getFields = () => {
    const children = [];
    expand &&
      children.push(
        <Col span={8} key={5}>
          <Form.Item name="tags" label="Tags">
            <Selector mode="multiple" action="Tags" placeholder="Filter Tags" />
          </Form.Item>
        </Col>,
        <Col span={8} key={6}>
          <Form.Item name="categories" label="Categories">
            <Selector mode="multiple" action="Categories" placeholder="Filter Categories" />
          </Form.Item>
        </Col>,
        <Col span={8} key={7}>
          <Form.Item name="authors" label="Authors">
            <Selector
              mode="multiple"
              action="Authors"
              placeholder="Filter Authors"
              display={'email'}
            />
          </Form.Item>
        </Col>,
      );
    return children;
  };
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

        <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
          <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search post" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col key={4}>
            <Form.Item name="status">
              <Select defaultValue="all">
                <Option value="all">Status: All</Option>
                <Option value="draft">Status: Draft</Option>
                <Option value="publish">Status: Publish</Option>
                <Option value="ready">Status: Ready to Publish</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort">
              <Select defaultValue="desc" style={{ width: '100%' }}>
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort By: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Button
            type="link"
            onClick={() => {
              setExpand(!expand);
            }}
          >
            {expand ? (
              <>
                Hide Filters <UpOutlined />
              </>
            ) : (
              <>
                More Filters <DownOutlined />
              </>
            )}
          </Button>
          <Col key={1}>
            <Link to="/fact-checks/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New FactCheck
              </Button>
            </Link>
          </Col>
        </Row>
        <Row gutter={16}>{getFields()}</Row>
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
