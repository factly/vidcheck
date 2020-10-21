import React from 'react';
import {InfoHeaderWrapper, InfoWrapper, VideoInfoWrapper} from "../../../../StyledComponents";
import {Input} from "antd";
import PropTypes from 'prop-types';
import Duration from "./Duration";

function InfoDetails({videoUrl, updateVideoUrl, played, setPlaying, playing, handleSeekChange, totalDuration}) {
    return (
        <VideoInfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Video URL</InfoHeaderWrapper>
                <Input
                    type="text"
                    value={videoUrl}
                    onChange={updateVideoUrl}
                />
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Actions</InfoHeaderWrapper>
                <button onClick={() => setPlaying(!playing)}>Play/Pause</button>
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Played</InfoHeaderWrapper>
                <progress max={1} value={played}/>
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Seek</InfoHeaderWrapper>
                <input
                    type='range' min={0} max={0.999999} step='any'
                    value={played}
                    onChange={handleSeekChange}
                />
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Total Time</InfoHeaderWrapper>
                <Duration seconds={totalDuration}/>
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Elapsed</InfoHeaderWrapper>
                <Duration seconds={totalDuration * played}/>
            </InfoWrapper>
            <InfoWrapper>
                <InfoHeaderWrapper>Remaining</InfoHeaderWrapper>
                <Duration seconds={totalDuration * (1 - played)}/>
            </InfoWrapper>
        </VideoInfoWrapper>
    )
}

InfoDetails.protoTypes = {
    videoUrl: PropTypes.string.isRequired,
    updateVideoUrl: PropTypes.func.isRequired,
    played: PropTypes.string.isRequired,
    setPlaying: PropTypes.func.isRequired,
    playing: PropTypes.bool.isRequired,
    handleSeekChange: PropTypes.func.isRequired,
    totalDuration: PropTypes.string.isRequired
}
export default InfoDetails;