import React from "react";
import { Button, Timeline, Tooltip } from "antd";
import PropTypes from "prop-types";
import {
  FactCheckReviewListWrapper,
  VideoAnalysisTimelineBarWrapper,
  VideoLengthBar,
  VideoLengthPart,
} from "../../../../StyledComponents";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { convertSecondsToTimeString } from "../../utilities/analysis";

function HorizontalTimelineBar({
  factCheckReview,
  currentFormdata = {},
  setCurrentFormData = () => {},
  height,
}) {
  return (
    <VideoAnalysisTimelineBarWrapper>
      <VideoLengthBar>
        {factCheckReview.map((review, index) => (
          <Tooltip
            title={
              convertSecondsToTimeString(review.start_time) +
              "-" +
              review.widthPercentage +
              convertSecondsToTimeString(review.end_time)
            }
            key={index}
          >
            <VideoLengthPart
              height={height}
              width={`${25}%`}
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

HorizontalTimelineBar.propTypes = {
  factCheckReview: PropTypes.array.isRequired,
  setCurrentFormData: PropTypes.func.isRequired,
};

function VerticalTimelineBar({
  totalDuration,
  factCheckReview,
  setCurrentFormData,
  onDeleteFactCheckReview,
}) {
  return (
    <FactCheckReviewListWrapper>
      <Timeline mode={"left"}>
        {factCheckReview &&
          factCheckReview.map((factcheckElem, index) => (
            <Timeline.Item
              label={`${convertSecondsToTimeString(
                factcheckElem.start_time
              )} - ${convertSecondsToTimeString(factcheckElem.end_time)}`}
              key={index}
            >
              <div style={{ display: "flex" }}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteFactCheckReview(index, totalDuration)}
                  style={{ margin: "0 10px 0 0" }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => setCurrentFormData(factcheckElem)}
                  style={{ margin: "0 10px 0 0" }}
                />
                <div>
                  <div style={{ "font-weight": "bold" }}>
                    {`CLAIM ${index + 1} `}
                  </div>
                </div>
              </div>
            </Timeline.Item>
          ))}
      </Timeline>
    </FactCheckReviewListWrapper>
  );
}

VerticalTimelineBar.propTypes = {
  factCheckReview: PropTypes.array.isRequired,
  setCurrentFormData: PropTypes.func.isRequired,
  onDeleteFactCheckReview: PropTypes.func.isRequired,
};

export { HorizontalTimelineBar, VerticalTimelineBar };
