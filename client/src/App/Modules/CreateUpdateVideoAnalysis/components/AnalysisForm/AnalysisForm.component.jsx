import React from "react";
import { Button, Form, Input, Select } from "antd";
import PropTypes from "prop-types";
import { FactCheckReviewFormWrapper } from "./AnalysisForm.styled";
import { recomputeAnalysisArray } from "../../CreateUpdateVideoAnalysis.utilities";

const { Option } = Select;

function AnalysisForm({
  formData,
  factCheckReview,
  setfactCheckReview,
  totalDuration,
  player,
  currentStartTime,
}) {
  const [form] = Form.useForm();
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  React.useEffect(() => {
    form.setFieldsValue({ ...formData });
  }, [form, formData]);

  React.useEffect(() => {
    form.setFieldsValue({
      ...form.getFieldsValue(),
      startTime: currentStartTime,
    });
  }, [form, currentStartTime]);

  const getTimeFraction = (timeString) => {
    const minute = timeString.split(":")[0];
    const second = timeString.split(":")[1];
    return (parseInt(minute, 10) * 60 + parseInt(second, 10)) / totalDuration;
  };

  const returnEndTimeFraction = (startTimeString, endTimeString) => {
    const endTimeFraction = getTimeFraction(endTimeString);
    if (endTimeFraction > 1) {
      alert("invalid end time");
      return;
    }
    if (getTimeFraction(startTimeString) > endTimeFraction) {
      alert(" start time greater than end time");
      return;
    }
    return endTimeFraction;
  };
  const onAddNewFactCheckReview = (values) => {
    const endTimeFraction = returnEndTimeFraction(
      values["startTime"],
      values["endTime"]
    );
    if (!endTimeFraction) {
      return;
    }
    values["endTimeFraction"] = endTimeFraction;

    setfactCheckReview((factCheckReview) => {
      let newData = [...factCheckReview, values].sort((a, b) => {
        return a.endTimeFraction - b.endTimeFraction;
      });
      return recomputeAnalysisArray(newData);
    });
    onReset();
  };

  const onReset = () => {
    form.resetFields();
  };

  const fillCurrentTime = () => {
    const currentPlayedTime = player.current.getCurrentTime();
    const minute = Math.floor(currentPlayedTime / 60);
    const seconds = Math.floor(currentPlayedTime % 60);
    form.setFieldsValue({
      ...form.getFieldsValue(),
      endTime: `${minute}:${seconds > 9 ? seconds : "0" + seconds}`,
    });
  };

  return (
    <FactCheckReviewFormWrapper>
      <Form form={form} name="control-hooks" onFinish={onAddNewFactCheckReview}>
        <Form.Item style={{ marginBottom: 0 }}>
          <Form.Item
            name="startTime"
            label="Start time(current time)"
            style={{ display: "inline-block", width: "calc(50% - 20px)" }}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="endTime"
            label="End time"
            rules={[
              {
                required: true,
                pattern: new RegExp(
                  /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
                ),
                message: "Wrong format! (mm:ss)",
              },
            ]}
            style={{ display: "inline-block", width: "calc(50% - 20px)" }}
          >
            <Input />
          </Form.Item>
          <span
            style={{
              display: "inline-block",
              width: "24px",
              textAlign: "center",
            }}
          >
            <Button type="link" onClick={fillCurrentTime}>
              now
            </Button>
          </span>
        </Form.Item>
        <Form.Item name="rating" label="Rating" rules={[{ required: true }]}>
          <Select placeholder="Select a rating of the claim" allowClear>
            <Option value="true">True</Option>
            <Option value="partial-true">Partial True</Option>
            <Option value="neutral">Neutral</Option>
            <Option value="partial-false">Partial False</Option>
            <Option value="false">False</Option>
          </Select>
        </Form.Item>

        <Form.Item name="claimed" label="Claimed" rules={[{ required: false }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="factCheckDetail"
          label="Fact check"
          rules={[{ required: false }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </FactCheckReviewFormWrapper>
  );
}

AnalysisForm.protoTypes = {
  factCheckReview: PropTypes.array.isRequired,
  formData: PropTypes.object.isRequired,
  setfactCheckReview: PropTypes.func.isRequired,
  totalDuration: PropTypes.number.isRequired,
  currentStartTime: PropTypes.string.isRequired,
  player: PropTypes.object.isRequired,
};
export default AnalysisForm;