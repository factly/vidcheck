import React from "react";
import { Button, Timeline } from "antd";
import { FactCheckReviewListWrapper } from "../../../../StyledComponents";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { convertSecondsToTimeString } from "../../../../utils/analysis";

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

export default VerticalTimelineBar;
