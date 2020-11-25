import React, { useState, useRef } from "react";
import { FactCheckReviewWrapper } from "../../../../StyledComponents";

import AnalysisForm from "../AnalysisForm";
import VideoPlayer from "./components/VideoPlayer";
import {
  HorizontalTimelineBar,
  VerticalTimelineBar,
} from "../AnalysisTimelineBar/AnalysisTimelineBar";
import { Button } from "antd";

import {
  convertTimeStringToSeconds,
  recomputeAnalysisArray,
  transformToServerCompatibleDate,
  transformVideoAnalysisdetails,
} from "../../utilities/analysis";

function StepTwo({ current, data = {}, onSubmit, summary, setCurrent }) {
  const [played, setPlayed] = useState(0);

  const [currentStartTime, setCurrentStartTime] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);

  const [factCheckReview, setfactCheckReview] = useState(
    data && data.analysis && data.analysis.length > 0
      ? transformVideoAnalysisdetails(data).analysis
      : []
  );
  const player = useRef(null);
  const [currentFormdata, setCurrentFormData] = useState({});

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
    const video_type = getHostname(summary.url);

    const data = {
      video: {
        video_type: video_type,
        ...summary,
      },
      analysis: factCheckReview,
    };

    onSubmit(transformToServerCompatibleDate(data));
  };

  return (
    <div style={current === 1 ? { display: "block" } : { display: "none" }}>
      <VideoPlayer
        player={player}
        played={played}
        setPlayed={setPlayed}
        totalDuration={totalDuration}
        setTotalDuration={setTotalDuration}
        setCurrentStartTime={setCurrentStartTime}
        factCheckReview={factCheckReview}
        videoUrl={summary.url}
      />
      <div>
        <HorizontalTimelineBar
          factCheckReview={factCheckReview}
          setCurrentFormData={updateFormState}
        />

        <FactCheckReviewWrapper>
          <div
            style={{
              width: "100%",
              padding: 10,
              margin: 5,
              background: "azure",
            }}
          >
            <AnalysisForm
              factCheckReview={factCheckReview}
              formData={currentFormdata}
              setfactCheckReview={setfactCheckReview}
              totalDuration={totalDuration}
              currentStartTime={currentStartTime}
              player={player}
            />
          </div>

          <div style={{ width: "100%" }}>
            <VerticalTimelineBar
              factCheckReview={factCheckReview}
              setCurrentFormData={updateFormState}
              onDeleteFactCheckReview={onDeleteFactCheckReview}
            />
          </div>
        </FactCheckReviewWrapper>
      </div>
      <div style={{ display: "flex", "justify-content": "flex-end" }}>
        <Button type="primary" onClick={submitFactcheck}>
          Submit Fact Check
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          "justify-content": "flex-end",
          marginTop: "20px",
        }}
      >
        <Button
          type="primary"
          onClick={() => setCurrent(0)}
          style={{ margin: 5 }}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={() => setCurrent(2)}
          style={{ margin: 5 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default StepTwo;
