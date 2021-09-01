import React from "react";
import CategoryList from "./components/CategoryList";
import { Space, Button, Form, Input, Select, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../../actions/categories";
import deepEqual from "deep-equal";

function Categories({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { Option } = Select;
  const [form] = Form.useForm();
  const { categories, total, loading } = useSelector((state) => {
    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        categories: node.data.map(
          (element) => state.categories.details[element]
        ),
        total: node.total,
        loading: state.categories.loading,
      };
    return { categories: [], total: 0, loading: state.categories.loading };
  });

  React.useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = () => {
    dispatch(getCategories(filters));
  };
  return (
    <Space direction="vertical">
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        onFinish={(values) => setFilters({ ...filters, ...values })}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            setFilters({ ...filters, ...changedValues });
          }
        }}
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
          <Col style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search categories" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort">
              <Select defaultValue="desc">
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort by: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Link key="1" to="/categories/create">
              <Button
                disabled={
                  !(actions.includes("admin") || actions.includes("create"))
                }
                type="primary"
              >
                New Category
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <CategoryList
        actions={actions}
        data={{ categories: categories, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchCategories={fetchCategories}
      />
    </Space>
  );
}

export default Categories;
