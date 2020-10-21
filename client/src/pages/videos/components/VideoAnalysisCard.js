import React, { useState } from "react";
import { Tooltip, Button } from "antd";
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

  return (
    <React.Fragment>
      <div>{data.video.url}</div>
      <div>{data.video.title}</div>
      <div>{data.video.summary}</div>
      <div>Total Claims : {data.analysis.length}</div>
      {/* <div>Total Time : {data.details.totalTime} min</div> */}
      <HorizontalTimelineBar
        factCheckReview={transformVideoAnalysisdetails(data).analysis}
      />
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
      <VideoLengthBar>
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
      </VideoLengthBar>
    </VideoAnalysisTimelineBarWrapper>
  );
}
