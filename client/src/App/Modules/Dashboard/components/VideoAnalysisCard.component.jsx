import React from "react";
import { Tooltip, Button } from "antd";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import {
    VideoAnalysisTimelineBarWrapper,
    VideoLengthBar, VideoLengthPart
} from "../../CreateUpdateVideoAnalysis/components/AnalysisTimelineBar/AnalysisTimelineBar.styled";

function VideoAnalysisCard({videoAnalysisData, deleteFunc}) {
    const history = useHistory();

    const gotoVideoAnalysisDetails = (id) => {
        history.push(`edit/${id}`);
    };

    return (
        <React.Fragment>
            <div>{videoAnalysisData.url}</div>
            <div>{videoAnalysisData.title}</div>
            <div>{videoAnalysisData.summary}</div>
            <div>Total Claims : {videoAnalysisData.details.totalClaims}</div>
            <div>Total Time : {videoAnalysisData.details.totalTime} min</div>
            <HorizontalTimelineBar factCheckReview={videoAnalysisData.details.claimsData}/>
            <Button onClick={() => gotoVideoAnalysisDetails(videoAnalysisData.id)}>
                {videoAnalysisData.id}
            </Button>
            <Button onClick={() => deleteFunc(videoAnalysisData.id)}>
                Delete
            </Button>
        </React.Fragment>
    )
}

VideoAnalysisCard.protoTypes = {
    videoAnalysisData: PropTypes.object.isRequired,
    deleteFunc: PropTypes.func.isRequired,
};

export default VideoAnalysisCard;


function HorizontalTimelineBar({ factCheckReview }) {
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
                    <Tooltip title={review.startTime + '-' +review.endTime} key={index}>
                        <VideoLengthPart
                            width={`${review.widthPercentage}%`}
                            backgroundColor={ratingColor[review.rating]}
                        >
                            <p>{review.rating}</p>
                        </VideoLengthPart>
                    </Tooltip>
                ))}
            </VideoLengthBar>
        </VideoAnalysisTimelineBarWrapper>
    );
}