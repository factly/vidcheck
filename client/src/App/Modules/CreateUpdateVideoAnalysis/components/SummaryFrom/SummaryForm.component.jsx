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
    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };
    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };
  return (
    <div style={{width: '80%'}}>
        <Form {...layout} form={form} name="control-hooks" onFinish={onUpdateSummaryFormData}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input />
            </Form.Item>
            <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
                <Input.TextArea />
            </Form.Item>
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </Form.Item>
        </Form>
    </div>
  );
}

SummaryForm.protoTypes = {
  data: PropTypes.object.isRequired,
  updateSummaryData: PropTypes.func.isRequired,
};
export default SummaryForm;
