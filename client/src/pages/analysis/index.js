import React, { useRef } from "react";

import { Button, Input, Form, Card, Popconfirm, Tooltip } from "antd";
import ReactPlayer from "react-player";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addVideo } from "../../actions/claims";
import {
  convertSecondsToTimeString,
  convertTimeStringToSeconds,
} from "../../utils/analysis";
import {
  DeleteOutlined,
  EditOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { deleteVideo } from "../../actions/claims";

function Analysis({ onSubmit }) {
  const history = useHistory();
  const [form] = Form.useForm();

  const { video, claims } = useSelector(({ videoClaims }) => videoClaims);
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
    history.push("/videos/claim");
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

  return (
    <>
      <div>
        <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              padding: "11px",
              fontWeight: "normal",
              fontSize: 14,
              textAlign: "center",
              backgroundColor: "#fafafa",
              width: "20%",
            }}
          >
            Title
          </div>
          <Input
            placeholder={"Enter title"}
            key="title"
            defaultValue={video.title ? video.title : ""}
            onChange={(e) =>
              dispatch(addVideo({ ...video, title: e.target.value }))
            }
          />
        </div>
        <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              padding: "11px",
              fontWeight: "normal",
              fontSize: 14,
              textAlign: "center",
              backgroundColor: "#fafafa",
              width: "20%",
            }}
          >
            URL
          </div>
          <Input
            placeholder={"Paste url here"}
            defaultValue={video.url ? video.url : ""}
            key="url"
            onChange={(e) =>
              dispatch(addVideo({ ...video, url: e.target.value }))
            }
          />
        </div>
        <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
          <div
            style={{
              border: "1px solid #d9d9d9",
              paddingTop: "11px",
              fontWeight: "normal",
              fontSize: 14,
              textAlign: "center",
              backgroundColor: "#fafafa",
              width: "20%",
            }}
          >
            Excerpt
          </div>
          <Input.TextArea
            key="excerpt"
            autoSize={{ minRows: 6, maxRows: 30 }}
            defaultValue={video.summary ? video.summary : ""}
            onChange={(e) =>
              dispatch(addVideo({ ...video, summary: e.target.value }))
            }
          />
        </div>
      </div>
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
                <Link to={`/videos/claim/${index}`}>
                  <EditOutlined key="edit" />
                </Link>,
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
          <Button
            type="primary"
            disabled={claims.length === 0}
            onClick={() => onSubmit({ video, claims })}
          >
            Submit
          </Button>
        </>
      ) : null}
    </>
  );
}

export default Analysis;
