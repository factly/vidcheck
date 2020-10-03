import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";
import {
  FactCheckReviewWrapper,
  PageWrapper,
  VideoInfoParentWrapper,
} from "./CreateUpdateVideoAnalysis.styled";
import InfoDetails from "./components/InfoDetails/InfoDetails.component";
import AnalysisForm from "./components/AnalysisForm/AnalysisForm.component";
import {
  HorizontalTimelineBar,
  VerticalTimelineBar,
} from "./components/AnalysisTimelineBar/AnalysisTimelineBar.components";
import { Button } from "antd";

import { useNetwork } from "../../../react-hooks/network/network";
import {
  getAllVideoAnalysisDetails,
  createVideoAnalysisDetails,
  updateVideoAnalysisDetails,
} from "./CreateUpdateVideoAnalysis.service";
import {
  recomputeAnalysisArray,
  transformVideoAnalysisdetails,
} from "./CreateUpdateVideoAnalysis.utilities";
import ApiSuspense from "../../Common/UIComponents/ApiSuspense.component";
import Summary from "./components/Summary/Summary.component";
import SummaryForm from "./components/SummaryFrom/SummaryForm.component";

function CreateUpdateVideoAnalysis() {
  const {
    response: allVideoAnalysisDetails,
    network: networkData,
    call: getAllVideoAnalysisDetailsCall,
  } = useNetwork(getAllVideoAnalysisDetails, {
    transformer: transformVideoAnalysisdetails,
  });

  const {
    network: networkCreateVideoAnalysisMeta,
    call: createVideoAnalysisDetailsCall,
  } = useNetwork(createVideoAnalysisDetails);

  const {
    network: networkUpdateVideoAnalysisMeta,
    call: updateVideoAnalysisDetailsCall,
  } = useNetwork(updateVideoAnalysisDetails);

  const [playing, setPlaying] = useState(true);
  const [played, setPlayed] = useState(0);
  const [summaryData, setSummaryData] = useState(
    allVideoAnalysisDetails ? allVideoAnalysisDetails.video : {}
  );
  const [currentStartTime, setCurrentStartTime] = useState(null);
  const [videoUrl, setVideoUrl] = useState(
    allVideoAnalysisDetails ? allVideoAnalysisDetails.video.url : ""
  );
  const [totalDuration, setTotalDuration] = useState(0);
  const [loopDetails, setLoopDetails] = useState({
    loopEnabled: false,
    startFraction: 0,
    endFraction: 1,
  });
  const [factCheckReview, setfactCheckReview] = useState(
    allVideoAnalysisDetails ? allVideoAnalysisDetails.analysis : []
  );
  const player = useRef(null);
  const [currentFormdata, setCurrentFormData] = useState({});
  const [showSummaryForm, setShowSummaryForm] = useState(true);

  const updateFromState = (data) => {
    setPlayed(data.endTimeFraction);
    player.current.seekTo(data.endTimeFraction, "fraction");
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
    const videoType = getHostname(videoUrl);
    const data = {
      video: {
        url: videoUrl,
        videoType,
        summary: summaryData.summary,
        title: summaryData.title,
      },
      analysis: factCheckReview,
    };
    createVideoAnalysisDetailsCall(data);
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
      if (currentPlayed < factCheckReview[index].endTimeFraction) {
        currentFormStartTime =
          index > 0 ? factCheckReview[index - 1].endTime : "00:00";
        break;
      }
    }
    if (typeof currentFormStartTime == "undefined") {
      if (factCheckReview.length === 0) {
        currentFormStartTime = "00:00";
      } else {
        currentFormStartTime =
          factCheckReview[factCheckReview.length - 1].endTime;
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

  const updateVideoUrl = (e) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);
  };

  const updateSummaryData = (data) => {
    setSummaryData(data);
    setShowSummaryForm(false);
  };

  return (
    <ApiSuspense meta={networkData || networkCreateVideoAnalysisMeta}>
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
        <HorizontalTimelineBar
          factCheckReview={factCheckReview}
          setCurrentFormData={updateFromState}
        />

        <FactCheckReviewWrapper>
          {summaryData ? <Summary data={summaryData} /> : null}
          <Button onClick={() => setShowSummaryForm(!showSummaryForm)}>
            {summaryData ? "Edit Summary" : "Add Summary"}
          </Button>
          <VerticalTimelineBar
            factCheckReview={factCheckReview}
            setCurrentFormData={updateFromState}
            onDeleteFactCheckReview={onDeleteFactCheckReview}
          />
          {showSummaryForm ? (
            <SummaryForm
              data={summaryData}
              updateSummaryData={updateSummaryData}
            />
          ) : (
            <AnalysisForm
              factCheckReview={factCheckReview}
              formData={currentFormdata}
              setfactCheckReview={setfactCheckReview}
              totalDuration={totalDuration}
              currentStartTime={currentStartTime}
              player={player}
            />
          )}
        </FactCheckReviewWrapper>
        <Button type="primary" onClick={submitFactcheck}>
          Submit Fact Check
        </Button>
      </PageWrapper>
    </ApiSuspense>
  );
}

export default CreateUpdateVideoAnalysis;
