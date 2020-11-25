import React from "react";
import { Button, Row, Col, Typography } from "antd";
import { useHistory } from "react-router-dom";

import { transformVideoAnalysisdetails } from "../../analysis/utilities/analysis";
import { useDispatch } from "react-redux";
import { deleteVideo } from "../../../actions/videos";
import { HorizontalTimelineBar } from "../../analysis/components/AnalysisTimelineBar/AnalysisTimelineBar";

function VideoAnalysisCard({ data }) {
  const history = useHistory();
  const dispatch = useDispatch();

  let ratingsCount = {};

  const getRatingsCount = () =>
    data.analysis?.map((each) => {
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
          <Typography.Title level={4}>{data.video.title}</Typography.Title>
          <Typography>{`${data.analysis.length} CLAIMS IN TOTAL`}</Typography>
          <div style={{ width: "30%" }}>
            <HorizontalTimelineBar
              factCheckReview={transformVideoAnalysisdetails(data).analysis}
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
              onClick={() => history.push(`/videos/${data.video.id}/edit`)}
            >
              Edit
            </Button>
            <Button
              onClick={() =>
                dispatch(deleteVideo(data.video.id)).then(() =>
                  history.push("/")
                )
              }
            >
              Delete
            </Button>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default VideoAnalysisCard;
