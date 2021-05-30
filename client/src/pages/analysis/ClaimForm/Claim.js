import { Button, Form, Input, Select, Space, DatePicker } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Editor from "../../../components/Editor";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getRatings } from "../../../actions/ratings";
import { getClaimants } from "../../../actions/claimants";
import deepEqual from "deep-equal";
import moment from "moment";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
} from "../../../utils/analysis";
import { Prompt } from "react-router-dom";

function Claim({ onCreate, data, video }) {
  const [shouldBlockNavigation, setShouldBlockNavigation] =
    React.useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });

  const { ratings, ratingloading } = useSelector((state) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        ratingloading: state.ratings.loading,
      };
    return { ratings: [], ratingloading: state.ratings.loading };
  });

  const { claimants, claimantloading } = useSelector((state) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        claimantloading: state.claimants.loading,
      };
    return { claimants: [], claimantloading: state.claimants.loading };
  });

  React.useEffect(() => {
    fetchRatings();
    fetchClaimants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (shouldBlockNavigation) {
        window.onbeforeunload = () => true;
      } else {
        window.onbeforeunload = undefined;
      }
    };
    handleBeforeUnload();
    return () => {
      window.removeEventListener("onbeforeunload", handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };
  const fetchClaimants = () => {
    dispatch(getClaimants(filters));
  };

  const onReset = () => {
    const start_time = form.getFieldValue("start_time");
    form.resetFields();

    form.setFieldsValue({ start_time });
  };

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 24 },
  };
  const initialValues = data
    ? {
        ...data,
        end_time: convertSecondsToTimeString(data.end_time),
        start_time: convertSecondsToTimeString(data.start_time),
        claim_date: data.claim_date ? moment(data.claim_date) : null,
        checked_date: data.checked_date ? moment(data.checked_date) : null,
      }
    : {
        end_time: convertSecondsToTimeString(video.end_time),
        start_time: convertSecondsToTimeString(video.start_time),
      };

  return (
    <>
      <Prompt
        when={shouldBlockNavigation}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <Form
        {...layout}
        initialValues={initialValues}
        form={form}
        onValuesChange={() => {
          setShouldBlockNavigation(true);
        }}
        onFinish={(values) => {
          setShouldBlockNavigation(false);
          const rating = ratings.find((each) => each.id === values.rating_id);
          onCreate({
            ...values,
            colour: rating.background_colour.hex,
            slug: rating.slug,
            start_time: convertTimeStringToSeconds(values.start_time),
            end_time: convertTimeStringToSeconds(values["end_time"]),
          });
        }}
        name="control-hooks"
        layout={"vertical"}
      >
        <Form.Item
          style={{
            marginBottom: 0,
            display: "flex",
            "justify-content": "flex-end",
          }}
        >
          <Form.Item
            name="start_time"
            label="Start time"
            style={{ display: "inline-block", width: "50%" }}
            rules={[
              {
                required: true,
                pattern: new RegExp(/^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/),
                message: "Wrong format! (mm:ss)",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="end_time"
            label="End time"
            rules={[
              {
                required: true,
                pattern: new RegExp(/^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/),
                message: "Wrong format! (mm:ss)",
              },
            ]}
            style={{ display: "inline-block", width: "50%" }}
          >
            <Input disabled />
          </Form.Item>
        </Form.Item>
        <Form.Item name="rating_id" label="Rating" rules={[{ required: true }]}>
          <Select
            placeholder="Select a rating of the claim"
            allowClear
            loading={ratingloading}
          >
            {ratings.map((rating) => (
              <Select.Option value={rating.id} key={rating.name + rating.id}>
                {rating["name"]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="claimant_id"
          label="Claimant"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Select a claimant of the claim"
            allowClear
            loading={claimantloading}
          >
            {claimants.map((claimant) => (
              <Select.Option
                value={claimant.id}
                key={claimant.name + claimant.id}
              >
                {claimant["name"]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="claim" label="Claim">
          <Input.TextArea autoSize={{ minRows: 4, maxRows: 7 }} />
        </Form.Item>
        <Form.Item
          name="fact"
          label="Fact"
          autoSize={{ minRows: 4, maxRows: 7 }}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name={"description"} label={"Description"}>
          <Editor />
        </Form.Item>
        <Form.Item name="claim_date" label="Claim Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name="checked_date" label="Checked Date">
          <DatePicker />
        </Form.Item>
        <Form.List name="review_sources" label="Review sources">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space
                  key={field.key}
                  style={{ marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "url"]}
                    fieldKey={[field.fieldKey, "url"]}
                    rules={[{ required: true, message: "Url required" }]}
                    wrapperCol={24}
                  >
                    <Input placeholder="Enter url" />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "description"]}
                    fieldKey={[field.fieldKey, "description"]}
                    rules={[
                      { required: true, message: "Description required" },
                    ]}
                    wrapperCol={24}
                  >
                    <Input placeholder="Enter description" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Review sources
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <div style={{ "justify-content": "flex-start", display: "flex" }}>
            <Button
              htmlType="submit"
              type="primary"
              style={{ "margin-right": "15px" }}
            >
              {data && data.start_time > -1 ? "Update Claim" : "Add Claim"}
            </Button>
            <Button onClick={onReset}>Reset Claim</Button>
          </div>
        </Form.Item>
      </Form>
    </>
  );
}

export default Claim;
