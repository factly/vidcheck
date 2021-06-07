import React, { useState } from "react";
import { Button, Form, Input, Space, InputNumber, Row, Col } from "antd";
import { maker, checker } from "../../../utils/sluger";
import { ChromePicker } from "react-color";
import Editor from "../../../components/Editor";
import MediaSelector from "../../../components/MediaSelector";

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const RatingForm = ({ onCreate, data = {} }) => {
  const [form] = Form.useForm();
  const [backgroundColour, setBackgroundColour] = useState(
    data.background_colour ? data.background_colour : null
  );
  const [textColour, setTextColour] = useState(
    data.text_colour ? data.text_colour : null
  );

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="creat-rating"
      onFinish={(values) => {
        onCreate(values);
        onReset();
      }}
    >
      <Form.Item
        name="name"
        label="Rating Name"
        rules={[
          {
            required: true,
            message: "Please enter the name!",
          },
          { min: 3, message: "Name must be minimum 3 characters." },
          { max: 50, message: "Name must be maximum 50 characters." },
        ]}
      >
        <Input onChange={(e) => onTitleChange(e.target.value)} />
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: "Please input the slug!",
          },
          {
            pattern: checker,
            message: "Please enter valid slug!",
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="numeric_value"
        label="Numeric value"
        rules={[
          {
            required: true,
            message: "Please enter the numeric value!",
          },
        ]}
      >
        <InputNumber min={1} max={100} />
      </Form.Item>
      <Form.Item label="Featured Image" name="medium_id">
        <MediaSelector />
      </Form.Item>

      <Form.Item name="background_colour" label="Background Colour">
        <ChromePicker
          color={backgroundColour !== null && backgroundColour.hex}
          onChange={(e) => setBackgroundColour(e)}
          disableAlpha
        />
      </Form.Item>
      <Form.Item name="text_colour" label="Text Colour">
        <ChromePicker
          color={textColour !== null && textColour.hex}
          onChange={(e) => setTextColour(e)}
          disableAlpha
        />
      </Form.Item>

      <Row
        className="preview-container"
        gutter={16}
        style={{ marginBottom: "1rem" }}
      >
        <Col span={10} style={{ textAlign: "right" }}>
          Preview:
        </Col>
        <Col span={8}>
          <div
            className="preview"
            style={{
              textAlign: "center",
              color: textColour?.hex,
              background: backgroundColour?.hex,
              width: "100px",
              padding: "0.5rem 1rem",
              border: "1px solid black",
            }}
          >
            Preview
          </div>
        </Col>
      </Row>

      <Form.Item name="description" label="Description">
        <Editor style={{ width: "600px" }} basic={true} />
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default RatingForm;
