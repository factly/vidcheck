import React from "react";
import ClaimantList from "./components/ClaimantList";
import { Space, Button, Form, Input, Select, Row, Col } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getClaimants } from "../../actions/claimants";
import deepEqual from "deep-equal";

function Claimants({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const { Option } = Select;
  const [form] = Form.useForm();
  const { claimants, total, loading } = useSelector((state) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        claimants: node.data.map(
          (element) => state.claimants.details[element]
        ),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });

  React.useEffect(() => {
    fetchClaimants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchClaimants = () => {
    dispatch(getClaimants(filters));
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
            sort_by: values.sort,
            q: values.q,
          })
        }
        style={{ maxWidth: "100%" }}
      >
        <Row justify="end" gutter={16}>
          <Col style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search claimant" />
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
            <Link to="/claimants/create">
              <Button
                type="primary"
              >
                New Claimant
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <ClaimantList
        actions={actions}
        data={{ claimants: claimants, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchClaimants={fetchClaimants}
      />
    </Space>
  );
}

export default Claimants;
