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

function HorizontalTimelineBar({ factCheckReview, setCurrentFormData }) {
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
              onClick={() => setCurrentFormData(review)}
            >
              <p style={{ margin: "0px", padding: "5px", "font-size": "10px" }}>
                {ratingValue[review.rating]}
              </p>
            </VideoLengthPart>
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
  factCheckReview,
  setCurrentFormData,
  onDeleteFactCheckReview,
}) {
  return (
    <FactCheckReviewListWrapper>
      <Timeline mode={"left"} style={{ "margin-left": "-20%" }}>
        {factCheckReview &&
          factCheckReview.map((factcheckElem, index) => (
            <Timeline.Item
              label={`${factcheckElem.start_time} - ${factcheckElem.end_time}`}
              key={index}
            >
              <div style={{ display: "flex" }}>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteFactCheckReview(index)}
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
                    {`${factcheckElem.rating}`}
                  </div>
                  <div>{`${factcheckElem.claimed}`}</div>
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
