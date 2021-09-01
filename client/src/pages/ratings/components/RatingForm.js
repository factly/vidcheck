import React, { useState, useEffect } from "react";
import { Button, Form, Input, Space, InputNumber, Row, Col, Collapse } from "antd";
import { maker, checker } from "../../../utils/sluger";
import { SketchPicker } from "react-color";
import Editor from "../../../components/Editor";
import MediaSelector from "../../../components/MediaSelector";
import MonacoEditor from "../../../components/MonacoEditor";
import getJsonValue from "../../../utils/getJsonValue";
import { Prompt } from "react-router-dom";

const RatingForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== "string") {
      data.meta_fields = JSON.stringify(data.meta_fields);
    }
  }
  const [form] = Form.useForm();
  const [backgroundColour, setBackgroundColour] = useState(
    data.background_colour ? data.background_colour : null
  );
  const [textColour, setTextColour] = useState(
    data.text_colour ? data.text_colour : null
  );

  const [name, setName] = useState("");
  const [shouldBlockNavigation, setShouldBlockNavigation] = useState(false);
  const [valueChange, setValueChange] = React.useState(false);

  const [displayBgColorPicker, setDisplayBgColorPicker] = useState(false);
  const [displayTextColorPicker, setDisplayTextColorPicker] = useState(false);

  const handleBgClick = () => {
    setDisplayBgColorPicker((prev) => !prev);
    setValueChange(true);
  };
  const handleTextClick = () => {
    setDisplayTextColorPicker((prev) => !prev);
    setValueChange(true);
  };

  const handleBgClose = () => {
    setDisplayBgColorPicker(false);
  };
  const handleTextClose = () => {
    setDisplayTextColorPicker(false);
  };
  const onReset = () => {
    form.resetFields();
    setBackgroundColour(data.background_colour ? data.background_colour : null);
    setTextColour(data.text_colour ? data.text_colour : null);
  };

  const onTitleChange = (string) => {
    setName(string);
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  useEffect(() => {
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
        form={form}
        initialValues={{ ...data }}
        name="creat-rating"
        layout="vertical"
        onFinish={(values) => {
          setShouldBlockNavigation(false);
          if (values.meta_fields) {
            values.meta_fields = getJsonValue(values.meta_fields);
          }
          values.text_colour = textColour;
          values.background_colour = backgroundColour;
          onCreate(values);
          onReset();
        }}
        onValuesChange={() => {
          setValueChange(true);
          setShouldBlockNavigation(true);
        }}
      >
        <Row justify="center" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Col span={24}>
            <Row justify="end" gutter={40}>
              <Form.Item>
                <Space>
                  <Button htmlType="button" onClick={onReset}>
                    Reset
                  </Button>
                  <Button disabled={!valueChange} type="primary" htmlType="submit">
                    {data && data.id ? 'Update' : 'Submit'}
                  </Button>
                </Space>
              </Form.Item>
            </Row>
          </Col>
          <Col span={24}>
            <Row
              gutter={40}
              justify="space-around"
              style={{ background: '#f0f2f5', padding: '1.25rem', marginBottom: '1rem' }}
            >
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Rating Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the name!',
                    },
                    { min: 3, message: 'Name must be minimum 3 characters.' },
                    { max: 50, message: 'Name must be maximum 50 characters.' },
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
                      message: 'Please input the slug!',
                    },
                    {
                      pattern: checker,
                      message: 'Please enter valid slug!',
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
                      message: 'Please enter the numeric value!',
                    },
                  ]}
                >
                  <InputNumber min={1} max={100} />
                </Form.Item>
                {/* <Form.Item label="Featured" name="is_featured" valuePropName="checked">
                <Switch />
              </Form.Item> */}
                <Form.Item name="background_colour" label="Background Colour">
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        padding: '5px',
                        background: '#fff',
                        borderRadius: '1px',
                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                        display: 'inline-block',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleBgClick()}
                    >
                      <div
                        style={{
                          width: '100px',
                          height: '24px',
                          borderRadius: '2px',
                          background: `${backgroundColour && backgroundColour.hex}`,
                        }}
                      />
                    </div>
                    {displayBgColorPicker ? (
                      <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}>
                        <div
                          style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                          }}
                          onClick={() => handleBgClose()}
                        />
                        <SketchPicker
                          color={backgroundColour !== null && backgroundColour.hex}
                          onChange={(e) => setBackgroundColour(e)}
                          disableAlpha
                        />
                      </div>
                    ) : null}
                  </div>
                </Form.Item>
                <Form.Item name="text_colour" label="Text Colour">
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        padding: '5px',
                        background: '#fff',
                        borderRadius: '1px',
                        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                        display: 'inline-block',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleTextClick()}
                    >
                      <div
                        style={{
                          width: '100px',
                          height: '24px',
                          borderRadius: '2px',
                          background: `${textColour && textColour.hex}`,
                        }}
                      />
                    </div>
                    {displayTextColorPicker ? (
                      <div style={{ position: 'absolute', zIndex: '2', top: 0, left: '120px' }}>
                        <div
                          style={{
                            position: 'fixed',
                            top: '0px',
                            right: '0px',
                            bottom: '0px',
                            left: '0px',
                          }}
                          onClick={() => handleTextClose()}
                        />
                        <SketchPicker
                          color={textColour !== null && textColour.hex}
                          onChange={(e) => setTextColour(e)}
                          disableAlpha
                        />
                      </div>
                    ) : null}
                  </div>
                </Form.Item>

                <Form.Item
                  className="preview-container"
                  label="Preview"
                  gutter={16}
                  style={{ marginBottom: '1rem' }}
                >
                  <div
                    className="preview"
                    style={{
                      textAlign: 'center',
                      color: textColour?.hex,
                      background: backgroundColour?.hex,
                      width: '110px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      border: '1px dotted black',
                    }}
                  >
                    Sample Text
                  </div>
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="Featured Image" name="medium_id">
                  <MediaSelector maxWidth={'350px'} containerStyles={{ justifyContent: 'start' }} />
                </Form.Item>
              </Col>
              <Col span={12} style={{ marginRight: 'auto', marginLeft: '20px' }}>
                <Form.Item name="description" label="Description">
                  <Editor
                    style={{ width: '600px', background: '#fff', padding: '0.5rem 0.75rem' }}
                    placeholder="Enter Description..."
                    basic={true}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={40} style={{ background: '#f0f2f5' }}>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
                style={{ width: '100%' }}
              >
                <Collapse.Panel header="Meta Data">
                  <Form.Item name={['meta', 'title']} label="Meta Title">
                    <Input />
                  </Form.Item>
                  <Form.Item name={['meta', 'description']} label="Meta Description">
                    <Input.TextArea />
                  </Form.Item>
                  <Form.Item name={['meta', 'canonical_URL']} label="Canonical URL">
                    <Input />
                  </Form.Item>
                </Collapse.Panel>
                <Collapse.Panel header="Code Injection">
                  <Form.Item name="header_code" label="Header Code">
                    <MonacoEditor language="html" width="100%" />
                  </Form.Item>
                  <Form.Item name="footer_code" label="Footer Code">
                    <MonacoEditor language="html" width="100%" />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
              <Collapse
                expandIconPosition="right"
                expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
                style={{ width: '100%' }}
              >
                <Collapse.Panel header="Meta Fields">
                  <Form.Item name="meta_fields">
                    <MonacoEditor language="json" width="100%" />
                  </Form.Item>
                </Collapse.Panel>
              </Collapse>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default RatingForm;
