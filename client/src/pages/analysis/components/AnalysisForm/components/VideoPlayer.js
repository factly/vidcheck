import React from "react";

import ReactPlayer from "react-player";
import { VideoInfoParentWrapper } from "../../../../../StyledComponents";
import {
  convertSecondsToTimeString,
  recomputeAnalysisArray,
} from "../../../utilities/analysis";
import { VerticalTimelineBar } from "../../AnalysisTimelineBar/AnalysisTimelineBar";

function VideoPlayer({
  totalDuration,
  setTotalDuration,
  setCurrentStartTime,
  player,
  factCheckReview,
  videoUrl,
  updateFormState,
  play,
  setfactCheckReview,
  setPlay,
}) {
  const onDeleteFactCheckReview = (removeIndex, totalDuration) => {
    setfactCheckReview((factCheckReview) =>
      recomputeAnalysisArray(factCheckReview, totalDuration, removeIndex)
    );
  };

  function handleProgress() {
    const currentPlayed = player.current.getCurrentTime();

    let index;
    let currentFormStartTime;
    for (index = 0; index < factCheckReview.length; ++index) {
      if (currentPlayed < factCheckReview[index].end_time) {
        currentFormStartTime =
          index > 0
            ? convertSecondsToTimeString(factCheckReview[index - 1].end_time)
            : "00:00";
        break;
      }
    }
    if (typeof currentFormStartTime == "undefined") {
      if (factCheckReview.length === 0) {
        currentFormStartTime = "00:00";
      } else {
        currentFormStartTime = convertSecondsToTimeString(
          factCheckReview[factCheckReview.length - 1].end_time
        );
      }
    }
    setCurrentStartTime(currentFormStartTime);
  }

  return (
    <VideoInfoParentWrapper>
      <ReactPlayer
        onPlay={setPlay(true)}
        url={videoUrl}
        playing={play}
        controls={true}
        ref={player}
        volume={0}
        onProgress={handleProgress}
        onDuration={setTotalDuration}
        visible={true}
      />
      <VerticalTimelineBar
        totalDuration={totalDuration}
        factCheckReview={factCheckReview}
        setCurrentFormData={updateFormState}
        onDeleteFactCheckReview={onDeleteFactCheckReview}
      />
    </VideoInfoParentWrapper>
  );
}

export default VideoPlayer;
