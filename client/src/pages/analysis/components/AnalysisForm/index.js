import React from "react";
import { Button, Form, Input, Select } from "antd";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
  recomputeAnalysisArray,
} from "../../utilities/analysis";
import { useSelector, useDispatch } from "react-redux";
import { getRatings } from "../../../../actions/ratings";
import deepEqual from "deep-equal";
import Editor from "../../../../components/Editor";

function AnalysisForm({
  formData,
  factCheckReview,
  setfactCheckReview,
  totalDuration,
  player,
  currentStartTime,
}) {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 5,
  });
  const { ratings, loading } = useSelector((state) => {
    const node = state.ratings.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        ratings: node.data.map((element) => state.ratings.details[element]),
        loading: state.ratings.loading,
      };
    return { ratings: [], loading: state.ratings.loading };
  });

  React.useEffect(() => {
    fetchRatings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.resetFields();
    form.setFieldsValue({ ...formData });
  }, [form, formData]);

  React.useEffect(() => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      start_time: currentStartTime,
    });
  }, [form, currentStartTime]);

  const returnEndTimeFraction = (startTimeString, endTimeString) => {
    const endTimeFraction =
      convertTimeStringToSeconds(endTimeString) / totalDuration;
    const startTimeFraction =
      convertTimeStringToSeconds(startTimeString) / totalDuration;
    if (endTimeFraction > 1) {
      alert("invalid end time");
      return;
    }
    if (startTimeFraction > endTimeFraction) {
      alert(" start time greater than end time");
      return;
    }
    return endTimeFraction;
  };
  const onAddNewFactCheckReview = (values) => {
    const endTimeFraction = returnEndTimeFraction(
      values["start_time"],
      values["end_time"]
    );
    if (!endTimeFraction) {
      return;
    }
    values["end_time_fraction"] = endTimeFraction;

    setfactCheckReview((factCheckReview) => {
      let newData = [...factCheckReview];
      if (values.id) {
        newData = newData.map((obj) => (values.id === obj.id ? values : obj));
      } else {
        newData = [...newData, values];
      }

      return recomputeAnalysisArray(newData);
    });

    onReset();
  };

  const onReset = () => {
    const start_time = form.getFieldValue("start_time");
    form.resetFields();

    form.setFieldsValue({ start_time });
  };

  const fillCurrentTime = () => {
    const currentPlayedTime = player.current.getCurrentTime();
    form.setFieldsValue({
      ...form.getFieldsValue(),
      end_time: convertSecondsToTimeString(currentPlayedTime),
    });
  };
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 24 },
  };

  const initialValues = {};

  if (factCheckReview && factCheckReview.length > 0) {
    const review = factCheckReview.find(
      (each) => each.start_time === currentStartTime
    );
    if (review) {
      form.setFieldsValue({
        rating: review.rating,
        claimed: review.claimed,
        factCheckDetail: review.factCheckDetail,
        start_time: review.start_time,
        end_time: review.end_time,
      });
    }
  }

  return (
    <Form
      initialValues={{
        ...initialValues,
      }}
      {...layout}
      form={form}
      name="control-hooks"
      onFinish={onAddNewFactCheckReview}
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
          <Input />
        </Form.Item>
        <span
          style={{
            display: "inline-block",
            width: "12px",
            position: "absolute",
            right: "16px",
          }}
        >
          <Button type="link" onClick={fillCurrentTime}>
            now
          </Button>
        </span>
      </Form.Item>
      <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
        <Select
          placeholder="Select a rating of the claim"
          allowClear
          loading={loading}
        >
          {ratings.map((rating) => (
            <Select.Option value={rating.id} key={rating.name + rating.id}>
              {rating["name"]}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="claimed" label="Claimed">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="factCheckDetail" label="Fact check">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={"description"} label={"Description"}>
        <Editor />
      </Form.Item>
      <Form.Item name={"review_sources"} label={"Review Sources"}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <div style={{ "justify-content": "flex-start", display: "flex" }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ "margin-right": "15px" }}
          >
            {form.getFieldValue("id") ? "Update" : "Add"}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

export default AnalysisForm;
