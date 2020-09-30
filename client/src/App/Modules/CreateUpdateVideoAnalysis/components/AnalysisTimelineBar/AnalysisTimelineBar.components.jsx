import React from 'react';
import {Button, Timeline, Tooltip} from "antd";
import PropTypes from 'prop-types'
import {VideoAnalysisTimelineBarWrapper, VideoLengthBar, VideoLengthPart, FactCheckReviewListWrapper} from "./AnalysisTimelineBar.styled";
import {DeleteOutlined} from "@ant-design/icons";

function HorizontalTimelineBar({factCheckReview}) {
    const ratingColor = {
        'true': '#19b346',
        'partial-true': '#8bb38d',
        'neutral': '#b3b3b3',
        'partial-false': '#b36d7e',
        'false': '#b30a25'

    };

    const timeBarClick = (a) => {
        console.log(a)
    }

    return (
        <VideoAnalysisTimelineBarWrapper>
            <VideoLengthBar>
                {factCheckReview.map((review, index) =>
                    <Tooltip title={review.endTime} key={index}>
                        <VideoLengthPart width={`${review.widthPercentage}%`}
                                         backgroundColor={ratingColor[review.rating]}
                                         onClick={() => timeBarClick(review)}>
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
    factCheckReview: PropTypes.array.isRequired
}


function VerticalTimelineBar({factCheckReview, onDeleteFactCheckReview}){
    return (
        <FactCheckReviewListWrapper>
            <Timeline mode={'left'}>
                {
                    factCheckReview && factCheckReview.map((factcheckElem, index) =>
                        <Timeline.Item label={`${factcheckElem.startTime} - ${factcheckElem.endTime}`}
                                       key={index}>
                            <Button type="primary" shape="circle" icon={<DeleteOutlined />} onClick={()=>onDeleteFactCheckReview(index)}/>
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
    onDeleteFactCheckReview: PropTypes.func.isRequired
}


export  {HorizontalTimelineBar, VerticalTimelineBar}