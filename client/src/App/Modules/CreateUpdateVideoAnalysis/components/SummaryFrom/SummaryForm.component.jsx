import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Form, Input } from "antd";

function SummaryForm({ data, updateSummaryData }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ ...data });
  }, [data]);

  const onUpdateSummaryFormData = (data) => {
    updateSummaryData(data);
  };
  return (
    <Form form={form} name="control-hooks" onFinish={onUpdateSummaryFormData}>
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
}

SummaryForm.protoTypes = {
  data: PropTypes.object.isRequired,
  updateSummaryData: PropTypes.func.isRequired,
};
export default SummaryForm;
