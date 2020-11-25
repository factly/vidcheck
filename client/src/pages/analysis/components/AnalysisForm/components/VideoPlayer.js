import React, { useState } from "react";

import ReactPlayer from "react-player";
import { VideoInfoParentWrapper } from "../../../../../StyledComponents";
import InfoDetails from "../../InfoDetails";

function VideoPlayer({
  played,
  setPlayed,
  totalDuration,
  setTotalDuration,
  setCurrentStartTime,
  player,
  factCheckReview,
  videoUrl,
}) {
  const [playing, setPlaying] = useState(true);
  const [loopDetails, setLoopDetails] = useState({
    loopEnabled: false,
    startFraction: 0,
    endFraction: 1,
  });

  function handleProgress() {
    const currentPlayedTime = player.current.getCurrentTime();
    const currentPlayed = currentPlayedTime / totalDuration;
    if (
      loopDetails.loopEnabled &&
      (currentPlayed < loopDetails.startFraction ||
        currentPlayed > loopDetails.endFraction)
    ) {
      player.current.seekTo(loopDetails.startFraction, "fraction");
      setPlaying(false);
    }
    let index;
    let currentFormStartTime;
    for (index = 0; index < factCheckReview.length; ++index) {
      if (currentPlayed < factCheckReview[index].end_time_fraction) {
        currentFormStartTime =
          index > 0 ? factCheckReview[index - 1].end_time : "00:00";
        break;
      }
    }
    if (typeof currentFormStartTime == "undefined") {
      if (factCheckReview.length === 0) {
        currentFormStartTime = "00:00";
      } else {
        currentFormStartTime =
          factCheckReview[factCheckReview.length - 1].end_time;
      }
    }
    setCurrentStartTime(currentFormStartTime);
    setPlayed(currentPlayed);
  }

  function handleSeekChange(e) {
    setPlayed(e.target.value);
    player.current.seekTo(e.target.value, "fraction");
  }

  return (
    <VideoInfoParentWrapper>
      <ReactPlayer
        url={videoUrl}
        playing={playing}
        controls={true}
        ref={player}
        volume={0}
        onProgress={handleProgress}
        onDuration={setTotalDuration}
      />
      <InfoDetails
        videoUrl={videoUrl}
        played={played}
        setPlaying={setPlaying}
        playing={playing}
        handleSeekChange={handleSeekChange}
        totalDuration={totalDuration}
      />
    </VideoInfoParentWrapper>
  );
}

export default VideoPlayer;
