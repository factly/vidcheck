import React from "react";
import { Button, Form, Input } from "antd";

function SummaryForm({ summary, setSummary }) {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ ...summary });
  }, [summary]);

  const onUpdateSummaryFormData = (summary) => {
    setSummary(summary);
  };
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  return (
    <div style={{ width: "80%", justifyContent: "center", marginTop: "40px" }}>
      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onFinish={onUpdateSummaryFormData}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="summary" label="Summary" rules={[{ required: true }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="url" label="Link" rules={[{ required: true }]}>
          <Input />
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

export default SummaryForm;
