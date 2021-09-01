import React from "react";
import TagList from "./components/TagList";
import { Space, Button, Form, Select, Row, Col, Input } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getTags } from "../../actions/tags";
import { Link } from "react-router-dom";
import deepEqual from "deep-equal";

function Tags({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  const { tags, total, loading } = useSelector((state) => {
    const node = state.tags.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        tags: node.data.map((element) => state.tags.details[element]),
        total: node.total,
        loading: state.tags.loading,
      };
    return { tags: [], total: 0, loading: state.tags.loading };
  });

  React.useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTags = () => {
    dispatch(getTags(filters));
  };
  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        onFinish={(values) =>
          setFilters({
            ...filters,
            ...values,
          })
        }
        style={{ width: '100%', maxWidth: '100%' }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            setFilters({ ...filters, ...changedValues });
          }
        }}
      >
        <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
          <Col style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search tags" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort">
              <Select defaultValue="desc">
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort By: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Link key="1" to="/tags/create">
              <Button
                disabled={
                  !(actions.includes("admin") || actions.includes("create"))
                }
                type="primary"
              >
                New Tag
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <TagList
        actions={actions}
        data={{ tags: tags, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchTags={fetchTags}
      />
    </Space>
  );
}

export default Tags;
