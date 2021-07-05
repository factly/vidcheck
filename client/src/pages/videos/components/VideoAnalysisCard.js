import React from "react";
import { Button, Row, Col, Typography, Popconfirm } from "antd";
import { Link, useHistory } from "react-router-dom";

import { useDispatch } from "react-redux";
import { deleteVideo, getVideos } from "../../../actions/videos";
import HorizontalTimelineBar from "../components/AnalysisTimelineBar/HorizontalTimelineBar";
import ImagePlaceholder from "../../../components/ImagePlaceholder";

function VideoAnalysisCard({ data }) {
  const history = useHistory();
  const dispatch = useDispatch();

  let ratingsCount = {};

  const getRatingsCount = () =>
    data.claims?.map((each) => {
      if (ratingsCount[each.rating.name]) {
        ratingsCount[each.rating.name].count += 1;
      } else {
        ratingsCount = { ...ratingsCount, [each.rating.name]: { count: 1, colour: each.rating.background_colour.hex } };
      }
    });
  getRatingsCount();


  return (
    <React.Fragment key={data.video.id}>
      <Row gutter={16}>
        <Col span={6}>
          {data.video.thumbnail_url ? (
            <img
              width={"100%"}
              alt="thumbnail"
              src={data.video.thumbnail_url}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Col>
        <Col span={18}>
          <Link to={`/fact-checks/${data.video.id}/preview`}>
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

          {Object.keys(ratingsCount).map((rating) => (
            <div
              style={{
                color: ratingsCount[rating].colour,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {ratingsCount[rating].count} {rating}
            </div>
          ))}

          <Typography.Paragraph ellipsis={true}>
            {data.video.summary}
          </Typography.Paragraph>
          <div style={{ marginBottom: "auto" }}>
            <Button onClick={() => history.push(`/fact-checks/${data.video.id}/preview`)}>
              Preview
            </Button>
            <Button
              onClick={() => history.push(`/fact-checks/${data.video.id}/edit`)}
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
