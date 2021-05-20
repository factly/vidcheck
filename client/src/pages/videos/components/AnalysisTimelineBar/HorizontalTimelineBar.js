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
  visible = false,
}) {
  let start_time = 0;
  let end_time = 0;
  return (
    <VideoAnalysisTimelineBarWrapper>
      <VideoLengthBar>
        {factCheckReview.map((review, index) => {
          if (review.start_time !== start_time) {
            let st = start_time;
            start_time = review.end_time + 1;
            end_time = review.start_time - 1;
            console.log({
              st,
              end_time,
              start_time,
              width: ((end_time - st) / totalDuration) * 100,
            });

            return (
              <>
                <VideoLengthPart
                  height={height}
                  width={`${((end_time - st) / totalDuration) * 100}%`}
                  backgroundColor={"#d9d9d9"}
                ></VideoLengthPart>
                <Tooltip
                  title={
                    convertSecondsToTimeString(review.start_time) +
                    "-" +
                    convertSecondsToTimeString(review.end_time)
                  }
                  key={index}
                  visible={visible}
                >
                  <VideoLengthPart
                    height={height}
                    width={`${
                      ((review.end_time - review.start_time) / totalDuration) *
                      100
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
                {index + 1 === factCheckReview.length &&
                review.end_time < totalDuration ? (
                  <VideoLengthPart
                    height={height}
                    width={`${
                      ((totalDuration - review.end_time + 1) / totalDuration) *
                      100
                    }%`}
                    backgroundColor={"#d9d9d9"}
                  ></VideoLengthPart>
                ) : null}
              </>
            );
          } else {
            start_time = review.end_time + 1;
            return (
              <>
                <Tooltip
                  title={
                    convertSecondsToTimeString(review.start_time) +
                    "-" +
                    convertSecondsToTimeString(review.end_time)
                  }
                  key={index}
                  visible={visible}
                >
                  <VideoLengthPart
                    height={height}
                    width={`${
                      ((review.end_time - review.start_time) / totalDuration) *
                      100
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
                {index + 1 === factCheckReview.length &&
                review.end_time < totalDuration ? (
                  <VideoLengthPart
                    height={height}
                    width={`${
                      ((totalDuration - review.end_time + 1) / totalDuration) *
                      100
                    }%`}
                    backgroundColor={"#d9d9d9"}
                  ></VideoLengthPart>
                ) : null}
              </>
            );
          }
        })}
      </VideoLengthBar>
    </VideoAnalysisTimelineBarWrapper>
  );
}

export default HorizontalTimelineBar;
