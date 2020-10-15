import React from "react";
import {Button, Form, Input, Select} from "antd";
import PropTypes from "prop-types";
import {FactCheckReviewFormWrapper} from "./AnalysisForm.styled";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
  recomputeAnalysisArray,
} from "../../CreateUpdateVideoAnalysis.utilities";

const {Option} = Select;

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
    wrapperCol: {offset: 8, span: 16},
  };
  React.useEffect(() => {
    form.resetFields();
    form.setFieldsValue({...formData});
  }, [form, formData]);

  React.useEffect(() => {
    if (form.getFieldValue("id")) {
      return;
    }
    form.setFieldsValue({
      ...form.getFieldsValue(),
      startTime: currentStartTime,
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
        values["startTime"],
        values["endTime"]
    );
    if (!endTimeFraction) {
      return;
    }
    values["endTimeFraction"] = endTimeFraction;

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
    const startTime = form.getFieldValue("startTime");
    form.resetFields();
    form.setFieldsValue({startTime});
  };

  const fillCurrentTime = () => {
    const currentPlayedTime = player.current.getCurrentTime();
    form.setFieldsValue({
      ...form.getFieldsValue(),
      endTime: convertSecondsToTimeString(currentPlayedTime),
    });
  };
  const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
  };

  return (
      <FactCheckReviewFormWrapper>
        <Form {...layout} form={form} name="control-hooks" onFinish={onAddNewFactCheckReview}>
          <Form.Item style={{marginBottom: 0, display: 'flex', "justify-content": 'flex-end'}}>
            <Form.Item
                name="startTime"
                label="Start time"
                style={{display: "inline-block", width: "50%"}}
            >
              <Input disabled/>
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
                style={{display: "inline-block", width: "50%"}}
            >
              <Input/>
            </Form.Item>
            <span
                style={{
                  display: 'inline-block',
                  width: '24px',
                  position: 'absolute',
                  right: '16px'
                }}
            >
              <Button type="link" onClick={fillCurrentTime}>
                now
              </Button>
            </span>
          </Form.Item>
          <Form.Item name="rating" label="Rating" rules={[{required: true}]}>
            <Select placeholder="Select a rating of the claim" allowClear>
              <Option value="True">True</Option>
              <Option value="Partial True">Partial True</Option>
              <Option value="Neutral">Neutral</Option>
              <Option value="Partial False">Partial False</Option>
              <Option value="False">False</Option>
            </Select>
          </Form.Item>

          <Form.Item name="claimed" label="Claimed">
            <Input.TextArea/>
          </Form.Item>
          <Form.Item name="factCheckDetail" label="Fact check">
            <Input.TextArea/>
          </Form.Item>
          <Form.Item name="id" hidden={true}>
            <Input.TextArea/>
          </Form.Item>
          <Form.Item {...tailLayout} >
            <div style={{'justify-content': 'flex-end','display': 'flex'}}>
              <Button type="primary" htmlType="submit" style={{'margin-right': "15px"}} >
                {form.getFieldValue("id") ? "Update" : "Add"}
              </Button>
              <Button htmlType="button" onClick={onReset}>
                Reset
              </Button>
            </div>
          </Form.Item>
        </Form>
      </FactCheckReviewFormWrapper>
  );
}

AnalysisForm.protoTypes = {
  factCheckReview: PropTypes.array.isRequired,
  formData: PropTypes.object,
  setfactCheckReview: PropTypes.func.isRequired,
  totalDuration: PropTypes.number.isRequired,
  currentStartTime: PropTypes.string.isRequired,
  player: PropTypes.object.isRequired,
};
export default AnalysisForm;
