import React from "react";
import { Button, Form, Input, Select, Space, DatePicker } from "antd";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
  recomputeAnalysisArray,
} from "../../../../utils/analysis";
import { useSelector, useDispatch } from "react-redux";
import { getRatings } from "../../../../actions/ratings";
import deepEqual from "deep-equal";
import Editor from "../../../../components/Editor";
import { getClaimants } from "../../../../actions/claimants";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

function AnalysisForm({
  formData,
  factCheckReview,
  setfactCheckReview,
  totalDuration,
  player,
  currentStartTime,
  setPlay,
}) {
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
      start_time: formData.start_time
        ? convertSecondsToTimeString(formData.start_time)
        : "00:00",
      end_time: formData.end_time
        ? convertSecondsToTimeString(formData.end_time)
        : null,
    });
  }, [form, formData]);

  React.useEffect(() => {
    const start_time =
      currentStartTime && convertTimeStringToSeconds(currentStartTime);

    let obj = factCheckReview.find((each) => each.start_time === start_time);
    if (obj) {
      obj = { ...obj, end_time: convertSecondsToTimeString(obj.end_time) };
    } else {
      obj = {};
    }

    form.setFieldsValue({
      ...obj,
      claim_date: obj.claim_date ? moment(obj.claim_date) : null,
      checked_date: obj.checked_date ? moment(obj.checked_date) : null,
      start_time: currentStartTime,
    });
  }, [form, currentStartTime]);

  const isEndTimeValid = (startTime, endTime) => {
    if (endTime > totalDuration) {
      alert("invalid end time");
      return;
    }
    if (startTime >= endTime) {
      alert(" start time greater than or equal to end time");
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

      const colour = ratings.find((each) => each.id === values.rating_id)
        .background_colour.hex;

      const currentIndex = factCheck.findIndex(
        (each) => each.start_time === formData.start_time
      );

      if (currentIndex > -1) {
        if (formData.end_time < end_time) {
          // this case handles when previous endtime moved towards right
          const node = newData.find(
            (each) => each.start_time >= formData.end_time
          );

          const leftIndex = newData.findIndex(
            (each) => each.start_time >= formData.end_time
          );

          let rightIndex = newData.findIndex(
            (each) => end_time <= each.end_time
          );

          if (rightIndex > -1) {
            newData[rightIndex].start_time = end_time;
          }
          newData[currentIndex] = {
            ...newData[currentIndex],
            ...values,
            start_time,
            end_time,
            colour,
          };

          if (rightIndex === -1) {
            newData.splice(leftIndex, newData.length - leftIndex);
          }
          if (leftIndex < rightIndex) {
            newData.splice(leftIndex, rightIndex - leftIndex);
          }
        } else if (formData.end_time > end_time) {
          // this case handles when previous endtime moved towards left
          const node = newData.find(
            (each) => each.end_time === formData.end_time
          );
          node.start_time = end_time;
          newData.push({ ...values, start_time, end_time, colour });
        } else {
          newData[currentIndex] = {
            ...newData[currentIndex],
            ...values,
            start_time,
            end_time,
            colour,
          };
        }
      } else {
        // this case handles when end_time is same & other values are updated
        newData = [...newData, { ...values, start_time, end_time, colour }];
      }

      return recomputeAnalysisArray(newData, totalDuration);
    });
    onReset();
  };

  const onReset = () => {
    const start_time = form.getFieldValue("end_time");
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

  if (factCheckReview && factCheckReview.length > 0) {
    const review = factCheckReview.find(
      (each) =>
        convertSecondsToTimeString(each.start_time) ===
        convertSecondsToTimeString(currentStartTime)
    );
    if (review) {
      form.setFieldsValue({
        end_time: convertSecondsToTimeString(review.end_time),
        rating_id: review.rating_id,
        claim: review.claim,
        fact: review.fact,
        start_time: convertSecondsToTimeString(review.start_time),
      });
    }
  }

  return (
    <Form
      {...layout}
      form={form}
      onValuesChange={() => setPlay(false)}
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
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="fact" label="Fact">
        <Editor />
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
      <Form.List name="claim_sources" label="Claim sources">
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
                  rules={[{ required: true, message: "Description required" }]}
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
                Add Claim sources
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

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
                  rules={[{ required: true, message: "Description required" }]}
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
            type="primary"
            htmlType="submit"
            style={{ "margin-right": "15px" }}
          >
            {factCheckReview.findIndex(
              (each) =>
                each.start_time ===
                convertTimeStringToSeconds(form.getFieldValue("start_time"))
            ) > -1
              ? "Update Claim"
              : "Add Claim"}
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
