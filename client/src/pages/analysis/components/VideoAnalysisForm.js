import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import {
  FactCheckReviewWrapper,
  PageWrapper,
  TimelineWrapper,
  VideoInfoParentWrapper,
} from "../../../StyledComponents";
import InfoDetails from "./InfoDetails";
import AnalysisForm from "./AnalysisForm";
import {
  HorizontalTimelineBar,
  VerticalTimelineBar,
} from "./AnalysisTimelineBar/AnalysisTimelineBar";
import { Button } from "antd";

import {
  convertTimeStringToSeconds,
  recomputeAnalysisArray,
  transformToServerCompatibleDate,
  transformVideoAnalysisdetails,
} from "../utilities/analysis";
import Summary from "./Summary";
import SummaryForm from "./SummaryForm";

function VideoAnalysisForm({ data, onSubmit }) {
  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [summaryData, setSummaryData] = useState(
    data && data.video
      ? { title: data.video.title, summary: data.video.summary }
      : {}
  );
  const [currentStartTime, setCurrentStartTime] = useState(null);
  const [videoUrl, setVideoUrl] = useState(
    data && data.video && data.video.url ? data.video.url : ""
  );
  const [totalDuration, setTotalDuration] = useState(0);
  const [loopDetails, setLoopDetails] = useState({
    loopEnabled: false,
    startFraction: 0,
    endFraction: 1,
  });

  const [factCheckReview, setfactCheckReview] = useState(
    data && data.analysis && data.analysis.length > 0
      ? transformVideoAnalysisdetails(data).analysis
      : []
  );
  const player = useRef(null);
  const [currentFormdata, setCurrentFormData] = useState({});
  const [showSummaryForm, setShowSummaryForm] = useState(
    data && data.analysis && data.analysis.length > 0 ? false : true
  );

  const updateFormState = (data) => {
    setPlayed(data.end_time_fraction);
    player.current.seekTo(
      convertTimeStringToSeconds(data.start_time),
      "seconds"
    );
    setCurrentFormData(data);
  };
  const onDeleteFactCheckReview = (removeIndex) => {
    setfactCheckReview((factCheckReview) =>
      recomputeAnalysisArray(factCheckReview, removeIndex)
    );
  };

  const getHostname = (url) => {
    // use URL constructor and return hostname
    return new URL(url).hostname;
  };

  const submitFactcheck = () => {
    const video_type = getHostname(videoUrl);

    const data = {
      video: {
        url: videoUrl,
        video_type: video_type,
        summary: summaryData.summary,
        title: summaryData.title,
      },
      analysis: factCheckReview,
    };

    onSubmit(transformToServerCompatibleDate(data));
  };

  function handleSeekChange(e) {
    setPlayed(e.target.value);
    player.current.seekTo(e.target.value, "fraction");
  }

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

  const playOnLoop = () => {
    if (loopDetails.loopEnabled) {
      setLoopDetails({ loopEnabled: false });
    } else {
      setLoopDetails({
        loopEnabled: true,
        startFraction: 0.2,
        endFraction: 0.3,
      });
    }
  };

  const addNewAnalysis = () => {
    setCurrentFormData({});
    setCurrentStartTime("00:00");
  };

  const updateVideoUrl = (e) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
  };

  const updateSummaryData = (data) => {
    setSummaryData(data);
    setShowSummaryForm(false);
  }; // ok

  return (
    <PageWrapper>
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
          updateVideoUrl={updateVideoUrl}
          played={played}
          setPlaying={setPlaying}
          playing={playing}
          handleSeekChange={handleSeekChange}
          totalDuration={totalDuration}
        />
      </VideoInfoParentWrapper>
      {videoUrl ? (
        <TimelineWrapper>
          <HorizontalTimelineBar
            factCheckReview={factCheckReview}
            setCurrentFormData={updateFormState}
          />

          <FactCheckReviewWrapper>
            {showSummaryForm ? (
              <SummaryForm
                data={summaryData}
                updateSummaryData={updateSummaryData}
              />
            ) : (
              <div style={{ width: "40%" }}>
                <AnalysisForm
                  factCheckReview={factCheckReview}
                  formData={currentFormdata}
                  setfactCheckReview={setfactCheckReview}
                  totalDuration={totalDuration}
                  currentStartTime={currentStartTime}
                  player={player}
                />
              </div>
            )}
            {showSummaryForm ? null : (
              <div style={{ width: "60%" }}>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "flex-end",
                    padding: "0 20px",
                  }}
                >
                  <Button type="primary" onClick={addNewAnalysis}>
                    Add new Analysis
                  </Button>
                </div>
                <div>
                  <VerticalTimelineBar
                    factCheckReview={factCheckReview}
                    setCurrentFormData={updateFormState}
                    onDeleteFactCheckReview={onDeleteFactCheckReview}
                  />
                </div>
              </div>
            )}
          </FactCheckReviewWrapper>
        </TimelineWrapper>
      ) : null}
      {showSummaryForm ? null : (
        <React.Fragment>
          <div style={{ padding: "0 18%" }}>
            <Summary data={summaryData} />
            <div>
              <Button
                type="link"
                onClick={() => setShowSummaryForm(!showSummaryForm)}
              >
                Edit Summary
              </Button>
            </div>
          </div>
        </React.Fragment>
      )}
      <div style={{ display: "flex", "justify-content": "center" }}>
        <Button type="primary" onClick={submitFactcheck}>
          Submit Fact Check
        </Button>
      </div>
    </PageWrapper>
  );
}

export default VideoAnalysisForm;
