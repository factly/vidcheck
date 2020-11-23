import React from "react";
import { Tooltip, Button, Row, Col, Typography } from "antd";
import { useHistory } from "react-router-dom";
import {
  VideoAnalysisTimelineBarWrapper,
  VideoLengthBar,
  VideoLengthPart,
} from "../../../StyledComponents";
import { transformVideoAnalysisdetails } from "../../analysis/utilities/analysis";
import { useDispatch } from "react-redux";
import { deleteVideo } from "../../../actions/videos";

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
        <Col span={4}>
          <img
            width={"100%"}
            alt="thumbnail"
            src={`https://img.youtube.com/vi/${getId(data.video.url)}/0.jpg`}
          />
        </Col>
        <Col span={18}>
          <Typography.Title level={2}>{data.video.title}</Typography.Title>
          <Typography>{`${data.analysis.length} CLAIMS IN TOTAL`}</Typography>
          <HorizontalTimelineBar
            factCheckReview={transformVideoAnalysisdetails(data).analysis}
          />
          <br />

          <Typography>{data.video.summary}</Typography>

          <Button onClick={() => history.push(`/videos/${data.video.id}/edit`)}>
            Edit
          </Button>
          <Button
            onClick={() =>
              dispatch(deleteVideo(data.video.id)).then(() => history.push("/"))
            }
          >
            Delete
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  );
}

export default VideoAnalysisCard;

function HorizontalTimelineBar({ factCheckReview }) {
  const ratingColor = {
    1: "#19b346",
    2: "#8bb38d",
    3: "#b3b3b3",
    4: "#b36d7e",
    5: "#b30a25",
  };

  const ratingValue = {
    1: "True",
    2: "Partly True",
    3: "Neutral",
    4: "Partly False",
    5: "False",
  };

  return (
    <VideoAnalysisTimelineBarWrapper>
      <div
        style={{
          color: "white",
          textAlign: "center",
          display: "flex",
          width: "100%",
          height: "25px",
        }}
      >
        {factCheckReview.map((review, index) => (
          <Tooltip
            title={review.start_time + "-" + review.end_time}
            key={index}
          >
            <VideoLengthPart
              width={`${review.widthPercentage}%`}
              backgroundColor={ratingColor[review.rating]}
            >
              <p>{ratingValue[review.rating]}</p>
            </VideoLengthPart>
          </Tooltip>
        ))}
      </div>
    </VideoAnalysisTimelineBarWrapper>
  );
}
