import React, { useRef, useState } from "react";

import {
  Button, Input, Form, Card, Popconfirm, Tooltip, Drawer,
  DatePicker, Space, Menu, Switch, Dropdown, Row, Col
} from "antd";
import ReactPlayer from "react-player";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addVideo, addClaim } from "../../actions/claims";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
} from "../../utils/analysis";
import { checker, maker } from '../../utils/sluger';
import {
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  SettingFilled
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { deleteVideo } from "../../actions/claims";

import Selector from "../../components/Selector";
import Claim from "./Claim";


function Analysis({ onSubmit }) {
  const history = useHistory();
  const [form] = Form.useForm();


  const [claim, setClaim] = useState({ index: -1, data: {}, drawerVisible: false });

  const showDrawer = () => {
    setClaim({ ...claim, drawerVisible: true });
  };
  const onClose = () => {
    setClaim({ ...claim, drawerVisible: false });
  };

  const { video, claims } = useSelector(({ videoClaims }) => videoClaims);
  const [status, setStatus] = useState(video.status ? video.status : 'draft');
  const dispatch = useDispatch();

  const player = useRef(null);

  const fillCurrentTime = (field) => {
    const currentPlayedTime = player.current.getCurrentTime();

    const values = {
      ...form.getFieldsValue(),
    };
    values[field] = convertSecondsToTimeString(currentPlayedTime);

    form.setFieldsValue({
      ...values,
    });
  };

  // to check any claims lies between selected time interval
  const timeValidation = (startTime, endTime) => {
    return (
      claims.filter(
        (each) => startTime < each.start_time && each.end_time < endTime
      ).length > 0
    );
  };

  const isEndTimeValid = (startTime, endTime) => {
    if (endTime > video.total_duration) {
      alert("end time can not exceed total duration");
      return;
    }
    if (startTime >= endTime) {
      alert("start time should be greater than or equal to end time");
      return;
    }

    if (timeValidation(startTime, endTime)) {
      alert("select time includes one or more claims");
      return;
    }

    dispatch(
      addVideo({
        ...video,
        start_time: form.getFieldValue("start_time"),
        end_time: form.getFieldValue("end_time"),
      })
    );

    setClaim({
      ...claim,
      data: {
        start_time: form.getFieldValue("start_time"),
        end_time: form.getFieldValue("end_time"),
      },
      drawerVisible: true
    })
  };

  const checkSelectedTime = (selectedTime) => {
    return (
      claims.filter(
        (each) =>
          convertTimeStringToSeconds(selectedTime) >= each.start_time &&
          convertTimeStringToSeconds(selectedTime) <= each.end_time
      ).length === 0
    );
  };

  const onTitleChange = (string) => {
    if (status !== 'publish') {
      form.setFieldsValue({
        slug: maker(string),
      });
    }
  };


  const onSubmitClaim = (values) => dispatch(addClaim(values));

  const setReadyFlag = () => {
    status === 'ready' ? setStatus('draft') : setStatus('ready');
  };

  const readyToPublish = (
    <Menu>
      <Menu.Item>
        Ready to Publish <Switch onChange={setReadyFlag} checked={status === 'ready'}></Switch>
      </Menu.Item>
    </Menu>
  );

  return <Form
    form={form}
    initialValues={{ ...video }}
    style={{ maxWidth: '100%', width: '100%' }}
    onFinish={(values) => console.log(values)}
    onValuesChange={() => {
      // setShouldBlockNavigation(true);
      // setValueChange(true);
    }}
    layout="vertical"
  >
    <Space direction="vertical">
      <div style={{ float: 'right' }}>
        <Space direction="horizontal">
          <Form.Item name="draft">
            <Dropdown overlay={readyToPublish}>
              <Button
                // disabled={!valueChange}
                type="secondary"
                htmlType="submit"
                onClick={() => (status === 'ready' ? setStatus('ready') : setStatus('draft'))}
              >
                Save
              </Button>
            </Dropdown>
          </Form.Item>
          {/* {actions.includes('admin') || actions.includes('publish') ? ( */}
          {true ? (
            <Form.Item name="submit">
              <Button type="secondary" htmlType="submit" onClick={() => setStatus('publish')}>
                {video.id && status === 'publish' ? 'Update' : 'Publish'}
              </Button>
            </Form.Item>
          ) : null}
          <Form.Item name="drawerOpen">
            <Button type="secondary" onClick={showDrawer}>
              <SettingFilled />
            </Button>
          </Form.Item>
        </Space>
      </div>
      <Row gutter={16}>
        <Col xs={{ span: 24 }} xl={{ span: 18, offset: 3 }} xxl={{ span: 12, offset: 6 }}>
          <Form.Item
            name="title"
            rules={[
              {
                required: true,
                message: 'Please input the title!',
              },
              { min: 3, message: 'Title must be minimum 3 characters.' },
              { max: 150, message: 'Title must be maximum 150 characters.' },
            ]}
          >
            <Input.TextArea
              bordered={false}
              placeholder="Add title for the post"
              onChange={(e) => onTitleChange(e.target.value)}
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                textAlign: 'center',
                resize: 'none',
              }}
              autoSize={{ minRows: 2, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              {
                required: true,
                message: 'Please input the title!',
              },
              { min: 3, message: 'Title must be minimum 3 characters.' },
              { max: 150, message: 'Title must be maximum 150 characters.' },
            ]}
          >
            <Input.TextArea
              bordered={false}
              placeholder="Paste url here"
              onChange={(e) =>
                dispatch(addVideo({ ...video, url: e.target.value }))
              }
              style={{
                fontSize: '1.5rem',
                textAlign: 'center',
                resize: 'none',
              }}
              defaultValue={video.url ? video.url : ""}
              autoSize={{ maxRows: 2 }}
            />
          </Form.Item>

          {video.url ? (
            <>
              <div style={{ marginLeft: "20%", padding: 20 }}>
                <ReactPlayer
                  //onPlay={setPlay(true)}
                  url={video.url}
                  playing={true}
                  controls={true}
                  ref={player}
                  volume={0}
                  // onProgress={handleProgress}
                  onDuration={(value) =>
                    dispatch(
                      addVideo({
                        ...video,
                        total_duration: value,
                        video_type: "youtube",
                      })
                    )
                  }
                  visible={true}
                />
              </div>
              <Form layout={"vertical"} form={form}>
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
                    rules={[
                      {
                        pattern: new RegExp(/^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/),
                        message: "Wrong format! (mm:ss)",
                      },
                      () => ({
                        validator(_, value) {
                          if (checkSelectedTime(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Selected start time is part of other claim")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input
                      addonAfter={
                        <Tooltip placement="top" title="Now">
                          {
                            <FieldTimeOutlined
                              onClick={() => fillCurrentTime("start_time")}
                            />
                          }
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="end_time"
                    label="End time"
                    rules={[
                      {
                        pattern: new RegExp(/^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/),
                        message: "Wrong format! (mm:ss)",
                      },
                      () => ({
                        validator(_, value) {
                          if (checkSelectedTime(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Selected end time is part of other claim")
                          );
                        },
                      }),
                    ]}
                    style={{ display: "inline-block", width: "50%" }}
                  >
                    <Input
                      addonAfter={
                        <Tooltip placement="top" title="Now">
                          {
                            <FieldTimeOutlined
                              onClick={() => fillCurrentTime("end_time")}
                            />
                          }
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Form.Item>
                <Form.Item>
                  <Button
                    htmlType="submit"
                    onClick={() => {
                      if (
                        !form.getFieldValue("start_time") ||
                        !form.getFieldValue("end_time")
                      ) {
                        alert("select start and end time");
                        return;
                      }
                      isEndTimeValid(
                        convertTimeStringToSeconds(
                          form.getFieldValue("start_time")
                        ),
                        convertTimeStringToSeconds(form.getFieldValue("end_time"))
                      );
                    }}
                  >
                    Add Claim
                  </Button>
                </Form.Item>
              </Form>
              {claims.map((each, index) => (
                <Card
                  style={{ margin: 5 }}
                  key={index}
                  actions={[
                    <EditOutlined key="edit" onClick={() => {
                      setClaim({ data: each, index, drawerVisible: true });
                    }} />,
                    <Popconfirm
                      title="Sure to Delete?"
                      onConfirm={() => dispatch(deleteVideo(index))}
                    >
                      <DeleteOutlined key="delete" />
                    </Popconfirm>,
                  ]}
                >
                  <p>Duration: </p>
                  <p>
                    {convertSecondsToTimeString(each.start_time) +
                      " - " +
                      convertSecondsToTimeString(each.end_time)}
                  </p>
                  {each.slug !== "not-a-claim" ? (
                    <>
                      <p>Claim: </p>
                      <p>{each.claim}</p>
                      <br />

                      {each.fact ? (
                        <>
                          <p>Fact:</p>
                          <div style={{ color: each.colour || "black" }}>
                            {each.fact}
                          </div>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <p>NO CLAIM IN THIS DURATION</p>
                  )}
                </Card>
              ))}
            </>
          ) : null}

          <Drawer
            title={<h4 style={{ fontWeight: 'bold' }}>Claim</h4>}
            placement="right"
            closable={true}
            onClose={onClose}
            visible={claim.drawerVisible}
            getContainer={false}
            width={"80%"}
            bodyStyle={{ paddingBottom: 40 }}
            headerStyle={{ fontWeight: 'bold' }}
            maskClosable={false}
          >
            {claim.drawerVisible ? <Claim onCreate={onSubmitClaim} claim={claim} setClaim={setClaim} /> : null}
          </Drawer>
        </Col>
      </Row>
    </Space>
  </Form>

}

export default Analysis;
