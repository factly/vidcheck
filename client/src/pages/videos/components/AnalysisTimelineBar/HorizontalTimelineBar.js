import React from "react";
import { Tooltip } from "antd";
import {
  VideoAnalysisTimelineBarWrapper,
  VideoLengthBar,
  VideoLengthPart,
} from "../../../../StyledComponents";
import { convertSecondsToTimeString } from "../../../../utils/analysis";

function HorizontalTimelineBar({
  factCheckReview,
  currentFormdata = {},
  setCurrentFormData = () => {},
  height,
  totalDuration,
}) {
  return (
    <VideoAnalysisTimelineBarWrapper>
      <VideoLengthBar>
        {factCheckReview.map((review, index) => (
          <Tooltip
            title={
              convertSecondsToTimeString(review.start_time) +
              "-" +
              convertSecondsToTimeString(review.end_time)
            }
            key={index}
            visible={false}
          >
            <VideoLengthPart
              height={height}
              width={`${
                ((review.end_time - review.start_time) / totalDuration) * 100
              }%`}
              showBorder={
                currentFormdata.id && currentFormdata.id === review.id
              }
              backgroundColor={review.colour || review.rating.colour.hex}
              onClick={() => {
                setCurrentFormData(review);
              }}
            ></VideoLengthPart>
          </Tooltip>
        ))}
      </VideoLengthBar>
    </VideoAnalysisTimelineBarWrapper>
  );
}

export default HorizontalTimelineBar;
