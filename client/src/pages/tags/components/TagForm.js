import React from "react";
import { Button, Form, Input, Space, Switch } from "antd";
import { maker, checker } from "../../../utils/sluger";
import Editor from "../../../components/Editor";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { Prompt } from "react-router-dom";

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const TagForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== "string") {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const [shouldBlockNavigation, setShouldBlockNavigation] = React.useState(false);

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

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
      window.removeEventListener('onbeforeunload', handleBeforeUnload);
    };
  }, [shouldBlockNavigation]);

  return (
    <>
      <Prompt
        when={shouldBlockNavigation}
        message="You have unsaved changes, are you sure you want to leave?"
      />
      <Form
        {...layout}
        form={form}
        initialValues={{ ...data }}
        name="create-tag"
        onFinish={(values) => {
          setShouldBlockNavigation(false);
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          onCreate(values);
          onReset();
        }}
        onValuesChange={() => {
          setValueChange(true);
          setShouldBlockNavigation(true);
        }}
      >
        <Form.Item
          name="name"
          label="Tag"
          rules={[
            {
              required: true,
              message: "Please enter tag name!",
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
        <Form.Item label="Featured" name="is_featured" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Editor
            style={{ width: "600px" }}
            placeholder="Enter Description..."
            basic={true}
          />
        </Form.Item>
        <Form.Item name="meta_fields" label="Metafields">
          <MonacoEditor language="json" />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Space>
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              {data && data.id ? "Update" : "Submit"}
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </>
  );
};

export default TagForm;
