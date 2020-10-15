import React from "react";
import {Button, Timeline, Tooltip} from "antd";
import PropTypes from "prop-types";
import {
  FactCheckReviewListWrapper,
  VideoAnalysisTimelineBarWrapper,
  VideoLengthBar,
  VideoLengthPart,
} from "./AnalysisTimelineBar.styled";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

function HorizontalTimelineBar({factCheckReview, setCurrentFormData}) {
  const ratingColor = {
    True: "#19b346",
    "Partial True": "#8bb38d",
    Neutral: "#b3b3b3",
    "Partial False": "#b36d7e",
    False: "#b30a25",
  };

  return (
      <VideoAnalysisTimelineBarWrapper>
        <VideoLengthBar>
          {factCheckReview.map((review, index) => (
              <Tooltip title={review.startTime + '-' + review.endTime} key={index}>
                <VideoLengthPart
                    width={`${review.widthPercentage}%`}
                    backgroundColor={ratingColor[review.rating]}
                    onClick={() => setCurrentFormData(review)}

                >
                  <p style={{margin: '0px', padding: '5px', 'font-size': '10px'}}>{review.rating}</p>
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
        <Timeline mode={"left"} style={{'margin-left': '-20%'}}>
          {factCheckReview &&
          factCheckReview.map((factcheckElem, index) => (
              <Timeline.Item
                  label={`${factcheckElem.startTime} - ${factcheckElem.endTime}`}
                  key={index}

              >
                <div style={{display:'flex'}}>
                <Button
                    type="primary"
                    shape="circle"
                    icon={<DeleteOutlined/>}
                    onClick={() => onDeleteFactCheckReview(index)}
                    style={{margin: '0 10px 0 0'}}
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<EditOutlined/>}
                    onClick={() => setCurrentFormData(factcheckElem)}
                    style={{margin: '0 10px 0 0'}}
                />
                <div>
                  <div style={{'font-weight': 'bold'}}>
                    {`${factcheckElem.rating}`}
                  </div>
                  <div>
                    {`${factcheckElem.claimed}`}
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

export {HorizontalTimelineBar, VerticalTimelineBar};
