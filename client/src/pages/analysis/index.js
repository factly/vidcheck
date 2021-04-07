import React from "react";

import { Button, Input, Form, Card, Popconfirm } from "antd";
import ReactPlayer from "react-player";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addVideo } from "../../actions/analysis";
import parseEditorJsData from "../../utils/jsonToHTML";
import { convertSecondsToTimeString } from "../../utils/analysis";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { deleteVideo } from "../../actions/analysis";

function Analysis({ onSubmit }) {
  const history = useHistory();
  const [form] = Form.useForm();

  const { video, claims } = useSelector(({ analysis }) => analysis);
  const dispatch = useDispatch();

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
              //ref={player}
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
              >
                <Input
                  disabled
                  defaultValue={
                    claims.length > 0
                      ? convertSecondsToTimeString(
                          claims[claims.length - 1].end_time
                        )
                      : "00:00"
                  }
                />
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
            </Form.Item>
            <Form.Item>
              <Button
                onClick={() => {
                  if (form.getFieldValue("end_time")) {
                    dispatch(
                      addVideo({
                        ...video,
                        end_time: form.getFieldValue("end_time"),
                      })
                    );
                    history.push("/analysis/claim");
                  } else alert("Please select end time");
                }}
              >
                Add New Claim
              </Button>
            </Form.Item>
          </Form>
          {claims.map((each, index) => (
            <Card
              style={{ margin: 5 }}
              actions={[
                <Link to={`/analysis/claim/${index}`}>
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
                      <div style={{ color: each.colour }}>
                        {parseEditorJsData(each.fact)}
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
            onClick={() => onSubmit({ video, analysis: claims })}
          >
            Submit
          </Button>
        </>
      ) : null}
    </>
  );
}

export default Analysis;
