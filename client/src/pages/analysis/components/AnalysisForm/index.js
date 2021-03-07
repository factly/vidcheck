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
import { getClaimants } from "../../../../actions/claimants";

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
    limit: 10,
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
  }, [filters]);

  const fetchRatings = () => {
    dispatch(getRatings(filters));
  };
  const fetchClaimants = () => {
    dispatch(getClaimants(filters));
  };

  const [form] = Form.useForm();

  React.useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      ...formData,
      end_time: formData.end_time
        ? convertSecondsToTimeString(formData.end_time)
        : null,
    });
  }, [form, formData]);

  React.useEffect(() => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      start_time: currentStartTime,
    });
  }, [form, currentStartTime]);

  const isEndTimeValid = (startTime, endTime) => {
    if (endTime > totalDuration) {
      alert("invalid end time");
      return;
    }
    if (startTime > endTime) {
      alert(" start time greater than end time");
      return;
    }
    return true;
  };

  const onAddNewFactCheckReview = (values) => {
    const start_time = convertTimeStringToSeconds(values["start_time"]);
    const end_time = convertTimeStringToSeconds(values["end_time"]);

    const isValid = isEndTimeValid(start_time, end_time);
    if (!isValid) {
      return;
    }

    setfactCheckReview((factCheck) => {
      let newData = [...factCheck];

      const colour = ratings.find((each) => each.id === values.rating_id).colour
        .hex;

      if (values.id) {
        newData = newData.map((obj) =>
          values.id === obj.id
            ? { ...values, start_time, end_time, colour }
            : obj
        );
      } else {
        newData = [...newData, { ...values, start_time, end_time, colour }];
      }

      return recomputeAnalysisArray(newData, totalDuration);
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
      (each) => each.start_time === convertSecondsToTimeString(currentStartTime)
    );
    if (review) {
      form.setFieldsValue({
        end_time: convertSecondsToTimeString(review.end_time),
        rating_id: review.rating_id,
        claim: review.claim,
        fact: review.fact,
        start_time: review.start_time,
      });
      console.log(form.getFieldValue());
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
        name="Claimant_id"
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
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="fact" label="Fact">
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={"review_sources"} label={"Review Sources"}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name={"description"} label={"Description"}>
        <Editor />
      </Form.Item>

      <Form.Item>
        <div style={{ "justify-content": "flex-start", display: "flex" }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ "margin-right": "15px" }}
          >
            {form.getFieldValue("id") ? "Update Claim" : "Add Claim"}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset Claim
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

export default AnalysisForm;
