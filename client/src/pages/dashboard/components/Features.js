import { Button, Typography, Card, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDefaultPolicies, getPolicies } from "../../../actions/policies";
import { addDefaultRatings, getRatings } from "../../../actions/ratings";
import { useHistory } from "react-router-dom";

function Features() {
  const dispatch = useDispatch();
  const history = useHistory();

  React.useEffect(() => {
    const fetchEntities = () => {
      dispatch(getRatings());

      dispatch(getPolicies());
    };
    fetchEntities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { ratings, policies } = useSelector(({ ratings, policies }) => {
    return {
      ratings: Object.keys(ratings.details).length,

      policies: Object.keys(policies.details).length,
    };
  });

  return (
    <>
      {ratings > 0 && policies > 0 ? null : (
        <Typography.Title level={3}>Add default features</Typography.Title>
      )}

      <Space>
        {ratings > 0 ? null : (
          <Card
            title="Ratings"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultRatings()).then(() =>
                    history.push("/ratings")
                  );
                }}
              >
                <PlusOutlined /> CREATE RATINGS
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            Five ratings will be created True, Partly True, Misleading, Partly
            False and False. Click below Button to create
          </Card>
        )}

        {policies > 0 ? null : (
          <Card
            title="Policies"
            actions={[
              <Button
                onClick={() => {
                  dispatch(addDefaultPolicies()).then(() =>
                    history.push("/policies")
                  );
                }}
              >
                <PlusOutlined /> CREATE POLICIES
              </Button>,
            ]}
            style={{ width: 300 }}
          >
            Three policies will be created Editor, Author and Contributor. Click
            below Button to create
          </Card>
        )}
      </Space>
    </>
  );
}

export default Features;
