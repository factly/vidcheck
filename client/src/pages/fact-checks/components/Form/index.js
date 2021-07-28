import React, { useRef, useState, useEffect } from "react";

import {
  Button,
  Input,
  Form,
  Card,
  Popconfirm,
  Tooltip,
  Drawer,
  DatePicker,
  Space,
  Menu,
  Switch,
  Dropdown,
  Row,
  Col,
} from "antd";
import ReactPlayer from "react-player";
import { useDispatch, useSelector } from "react-redux";
import { addVideo, addClaim } from "../../../../actions/claims";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
} from "../../../../utils/analysis";
import { checker, maker } from "../../../../utils/sluger";
import {
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
  SettingFilled,
} from "@ant-design/icons";
import { deleteVideo } from "../../../../actions/claims";
import moment from "moment";

import Selector from "../../../../components/Selector";
import Claim from "../Claim";

import { setCollapse } from "../../../../actions/sidebar";
import { addSuccessNotification } from "../../../../actions/notifications";

function Analysis({ onSubmit }) {
  const [form] = Form.useForm();
  const [claimform] = Form.useForm();
  const sidebar = useSelector((state) => state.sidebar);
  const [settingsDrawerVisible, setSettingsDrawerVisible] = useState(false);
  const [claim, setClaim] = useState({
    index: -1,
    data: {},
    drawerVisible: false,
  });

  const showSettings = () => {
    setSettingsDrawerVisible(true);
  };
  const onClose = () => {
    setClaim({ ...claim, drawerVisible: false });
  };
  const onCloseSettings = () => {
    setSettingsDrawerVisible(false);
  };

  const { video, claims } = useSelector(({ videoClaims }) => videoClaims);
  const [status, setStatus] = useState(video.status || "draft");
  const dispatch = useDispatch();

  const player = useRef(null);

  useEffect(() => {
    const prev = sidebar.collapsed;
    if (!sidebar.collapsed) {
      dispatch(setCollapse(true));
    }
    return () => {
      if (!prev) dispatch(setCollapse(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTitleChange = (string) => {
    claimform.setFieldsValue({
      slug: maker(string),
    });
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
        (each) => (startTime < each.start_time && each.end_time < endTime) || (each.start_time <= startTime && endTime <= each.end_time) || (each.start_time <= startTime && startTime <= each.end_time) || (each.start_time <= endTime && endTime <= each.end_time)
      ).length > 0
    );
  };

  const isEndTimeValid = (startTime, endTime) => {
    if (endTime > video.total_duration) {
      alert("end time can not exceed total duration");
      return;
    }
    if (!(endTime > startTime)) {
      alert("end time should be greater than to start time");
      return;
    }

    if (timeValidation(startTime, endTime)) {
      alert("selected time is part of other claims");
      return;
    }

    setClaim({
      ...claim,
      data: {
        start_time: form.getFieldValue("start_time"),
        end_time: form.getFieldValue("end_time"),
      },
      drawerVisible: true,
    });
  };

  const onSubmitClaim = (values) => {
    dispatch(addClaim(values))
    dispatch(addSuccessNotification(claim.index >= 0 ? "Claim updated" : "Claim added"))
    setClaim({ data: {}, drawerVisible: false, index: -1 })
    form.resetFields();
  };

  const setReadyFlag = () => {
    status === "ready" ? setStatus("draft") : setStatus("ready");
  };

  const readyToPublish = (
    <Menu>
      <Menu.Item>
        Ready to Publish{" "}
        <Switch onChange={setReadyFlag} checked={status === "ready"}></Switch>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Form
        form={claimform}
        initialValues={{
          ...video, published_date: video.published_date
            ? moment(video.published_date)
            : null
        }}
        style={{ maxWidth: "100%", width: "100%" }}
        onFinish={(values) => {
          values.category_ids = values.categories || [];
          values.tag_ids = values.tags || [];
          values.author_ids = values.authors || [];
          values.status = status;
          values.status === "publish"
            ? (values.published_date = values.published_date
              ? moment(values.published_date).format("YYYY-MM-DDTHH:mm:ssZ")
              : moment(Date.now()).format("YYYY-MM-DDTHH:mm:ssZ"))
            : (values.published_date = null);
          onSubmit({
            video: {
              ...video,
              ...values,
              total_duration: video.total_duration,
              video_type: video.video_type,
            },
            claims,
          });
        }}
        layout="vertical"
        name="factcheck"
      >
        <Space direction="vertical">
          <div style={{ float: "right" }}>
            <Space direction="horizontal">
              <Form.Item name="draft">
                <Dropdown overlay={readyToPublish}>
                  <Button
                    // disabled={!valueChange}
                    type="secondary"
                    htmlType="submit"
                    onClick={() =>
                      status === "ready"
                        ? setStatus("ready")
                        : setStatus("draft")
                    }
                  >
                    Save
                  </Button>
                </Dropdown>
              </Form.Item>
              {/* {actions.includes('admin') || actions.includes('publish') ? ( */}
              {true ? (
                <Form.Item name="submit">
                  <Button
                    type="secondary"
                    htmlType="submit"
                    onClick={() => {
                      setStatus("publish");
                    }}
                  >
                    {video.id && status === "publish" ? "Update" : "Publish"}
                  </Button>
                </Form.Item>
              ) : null}
              <Form.Item name="drawerOpen">
                <Button type="secondary" onClick={showSettings}>
                  <SettingFilled />
                </Button>
              </Form.Item>
            </Space>
          </div>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Please input the title!",
                  },
                  { min: 3, message: "Title must be minimum 3 characters." },
                  {
                    max: 150,
                    message: "Title must be maximum 150 characters.",
                  },
                ]}
              >
                <Input.TextArea
                  bordered={false}
                  placeholder="Fact check title"
                  onChange={(e) => onTitleChange(e.target.value)}
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    resize: "none",
                  }}
                  autoSize
                  maxLength={150}
                />
              </Form.Item>
              <Form.Item
                name="url"
                rules={[
                  {
                    required: true,
                    message: "Please input the title!",
                  },
                  { min: 3, message: "Title must be minimum 3 characters." },
                  {
                    max: 150,
                    message: "Title must be maximum 150 characters.",
                  },
                ]}
              >
                <Input
                  bordered={false}
                  placeholder="Video URL"
                  style={{
                    fontSize: "1.5rem",
                    maxWidth: "600px",
                  }}
                  onChange={(e) =>
                    dispatch(
                      addVideo({
                        ...video,
                        url: e.target.value,
                      })
                    )
                  }
                />
              </Form.Item>

              {video.url ? (
                <>
                  <div style={{ padding: "20px 0" }}>
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
                      style={{
                        marginRight: "auto",
                        width: "720",
                        height: "405px",
                      }}
                      visible={true}
                    />
                  </div>
                  <Form
                    layout={"inline"}
                    form={form}
                    style={{ maxWidth: "100%" }}
                  >
                    <Form.Item
                      style={{
                        marginBottom: 0,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      }}
                    >
                      <Form.Item
                        name="start_time"
                        label="Start time"
                        style={{
                          display: "inline-block",
                          width: "50%",
                          maxWidth: "120px",
                        }}
                        rules={[
                          {
                            pattern: new RegExp(
                              /^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/
                            ),
                            message: "Wrong format! (mm:ss)",
                          },
                          () => ({
                            validator(_, value) {
                              if (checkSelectedTime(value)) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(
                                  "Selected start time is part of other claim"
                                )
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
                            pattern: new RegExp(
                              /^[0-2]?[0-9]?[0-9]:[0-5][0-9]$/
                            ),
                            message: "Wrong format! (mm:ss)",
                          },
                          () => ({
                            validator(_, value) {
                              if (checkSelectedTime(value)) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error(
                                  "Selected end time is part of other claim"
                                )
                              );
                            },
                          }),
                        ]}
                        style={{
                          display: "inline-block",
                          width: "50%",
                          maxWidth: "120px",
                        }}
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
                    <Form.Item noStyle>
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
                            convertTimeStringToSeconds(
                              form.getFieldValue("end_time")
                            )
                          );
                        }}
                        style={{ alignSelf: "flex-end" }}
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
                        <EditOutlined
                          key="edit"
                          onClick={() => {
                            setClaim({
                              data: each,
                              index,
                              drawerVisible: true,
                            });
                          }}
                        />,
                        <Popconfirm
                          title="Sure to Delete?"
                          onConfirm={() => {
                            dispatch(deleteVideo(index))
                            dispatch(addSuccessNotification("Claim deleted"))
                          }}
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
                title={<h4 style={{ fontWeight: "bold" }}>Settings</h4>}
                placement="right"
                onClose={onCloseSettings}
                visible={settingsDrawerVisible}
                getContainer={false}
                width={"25%"}
                bodyStyle={{ paddingBottom: 40 }}
                headerStyle={{ fontWeight: "bold" }}
              >
                <Form.Item
                  name="excerpt"
                  label="Excerpt"
                  rules={[
                    { min: 3, message: "Title must be minimum 3 characters." },
                    {
                      max: 5000,
                      message: "Excerpt must be a maximum of 5000 characters.",
                    },
                    {
                      message: "Add Excerpt",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Excerpt"
                    style={{ fontSize: "medium" }}
                  />
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
                <Form.Item name="published_date" label="Published Date">
                  <DatePicker />
                </Form.Item>
                <Form.Item name="categories" label="Categories">
                  <Selector
                    mode="multiple"
                    action="Categories"
                    createEntity="Category"
                  />
                </Form.Item>

                <Form.Item name="tags" label="Tags">
                  <Selector mode="multiple" action="Tags" createEntity="Tag" />
                </Form.Item>
                <Form.Item
                  name="authors"
                  label="Authors"
                >
                  <Selector
                    mode="multiple"
                    display={"email"}
                    action="Authors"
                  />
                </Form.Item>
              </Drawer>
            </Col>
          </Row>
        </Space>
      </Form>

      <Drawer
        title={<h4 style={{ fontWeight: "bold" }}>Claim</h4>}
        placement="right"
        closable={true}
        onClose={onClose}
        visible={claim.drawerVisible}
        getContainer={false}
        width={"75%"}
        bodyStyle={{ paddingBottom: 40 }}
        headerStyle={{ fontWeight: "bold" }}
        maskClosable={false}
      >
        {claim.drawerVisible ? (
          <Claim onCreate={onSubmitClaim} claim={claim} setClaim={setClaim} />
        ) : null}
      </Drawer>
    </>
  );
}

export default Analysis;
