import React from "react";
import { Button, Row, Col, Typography, Popconfirm } from "antd";
import { Link, useHistory } from "react-router-dom";

import { useDispatch } from "react-redux";
import { deleteVideo, getVideos } from "../../../actions/videos";
import HorizontalTimelineBar from "../components/AnalysisTimelineBar/HorizontalTimelineBar";

function VideoAnalysisCard({ data }) {
  const history = useHistory();
  const dispatch = useDispatch();

  let ratingsCount = {};

  const getRatingsCount = () =>
    data.claims?.map((each) => {
      if (ratingsCount[each.rating.name]) {
        ratingsCount[each.rating.name] += 1;
      } else {
        ratingsCount = { ...ratingsCount, [each.rating.name]: { count: 1 } };
      }
    });
  getRatingsCount();

  const getId = (url) => {
    const index = url.indexOf("?v=") + 3;
    return url.substring(index, url.length);
  };

  return (
    <React.Fragment>
      <Row gutter={16}>
        <Col span={6}>
          <img
            width={"100%"}
            alt="thumbnail"
            src={`https://img.youtube.com/vi/${getId(data.video.url)}/0.jpg`}
          />
        </Col>
        <Col span={18}>
          <Link to={`/preview/${data.video.id}`}>
            <Typography.Title level={4}>{data.video.title}</Typography.Title>
          </Link>

          <Typography>{`${data.claims.length} CLAIMS IN TOTAL`}</Typography>
          <div style={{ width: "30%" }}>
            <HorizontalTimelineBar
              totalDuration={data.video.total_duration}
              factCheckReview={data.claims}
              height={"12px"}
            />
          </div>
          <br />

          <Typography.Paragraph ellipsis={true}>
            {data.video.summary}
          </Typography.Paragraph>
          <div style={{ marginBottom: "auto" }}>
            <Button onClick={() => history.push(`/preview/${data.video.id}`)}>
              Preview
            </Button>
            <Button
              onClick={() => history.push(`/analysis/${data.video.id}/edit`)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Sure to Delete?"
              onConfirm={() =>
                dispatch(deleteVideo(data.video.id)).then(() =>
                  dispatch(getVideos())
                )
              }
            >
              <Button>Delete</Button>
            </Popconfirm>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default VideoAnalysisCard;
