import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";

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
            <button onClick={() => gotoVideoAnalysisDetails(videoAnalysisData.id)}>
                {videoAnalysisData.id}
            </button>
            <button onClick={() => deleteFunc(videoAnalysisData.id)}>
                Delete
            </button>
        </React.Fragment>
    )
}

VideoAnalysisCard.protoTypes = {
    videoAnalysisData: PropTypes.object.isRequired,
    deleteFunc: PropTypes.func.isRequired,
};

export default VideoAnalysisCard;