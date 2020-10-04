import React from 'react';
import {Button, Timeline, Tooltip} from "antd";
import PropTypes from 'prop-types'
import {VideoAnalysisTimelineBarWrapper, VideoLengthBar, VideoLengthPart, FactCheckReviewListWrapper} from "./AnalysisTimelineBar.styled";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";

function HorizontalTimelineBar({factCheckReview, setCurrentFormData}) {
    const ratingColor = {
        'true': '#19b346',
        'partial-true': '#8bb38d',
        'neutral': '#b3b3b3',
        'partial-false': '#b36d7e',
        'false': '#b30a25'

    };

    return (
        <VideoAnalysisTimelineBarWrapper>
            <VideoLengthBar>
                {factCheckReview.map((review, index) =>
                    <Tooltip title={review.endTime} key={index}>
                        <VideoLengthPart width={`${review.widthPercentage}%`}
                                         backgroundColor={ratingColor[review.rating]}
                                         onClick={() => setCurrentFormData(review)}>
                            <p>{review.rating}</p>
                        </VideoLengthPart>
                    </Tooltip>
                )
                }
            </VideoLengthBar>
        </VideoAnalysisTimelineBarWrapper>
    )
}
HorizontalTimelineBar.propTypes = {
    factCheckReview: PropTypes.array.isRequired,
    setCurrentFormData: PropTypes.func.isRequired,
}


function VerticalTimelineBar({factCheckReview, setCurrentFormData, onDeleteFactCheckReview}){
    return (
        <FactCheckReviewListWrapper>
            <Timeline mode={'left'}>
                {
                    factCheckReview && factCheckReview.map((factcheckElem, index) =>
                        <Timeline.Item label={`${factcheckElem.startTime} - ${factcheckElem.endTime}`}
                                       key={index}>
                            <Button type="primary" shape="circle" icon={<DeleteOutlined />} onClick={()=>onDeleteFactCheckReview(index)}/>
                            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={()=>setCurrentFormData(factcheckElem)}/>
                            {`${factcheckElem.rating} - ${factcheckElem.claimed.substring(0, 40)}`}

                        </Timeline.Item>
                    )
                }
            </Timeline>
        </FactCheckReviewListWrapper>
    )
}
VerticalTimelineBar.propTypes = {
    factCheckReview: PropTypes.array.isRequired,
    setCurrentFormData: PropTypes.func.isRequired,
    onDeleteFactCheckReview: PropTypes.func.isRequired
}


export  {HorizontalTimelineBar, VerticalTimelineBar}