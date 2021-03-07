import React, { useState, useRef } from "react";
import { FactCheckReviewWrapper } from "../../../../StyledComponents";

import AnalysisForm from "../AnalysisForm";
import VideoPlayer from "./components/VideoPlayer";
import { HorizontalTimelineBar } from "../AnalysisTimelineBar/AnalysisTimelineBar";
import { Button } from "antd";

function StepTwo({ current, data = {}, onSubmit, summary, setCurrent }) {
  const [currentStartTime, setCurrentStartTime] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);

  const [factCheckReview, setfactCheckReview] = useState(
    data && data.analysis ? data.analysis : []
  );
  const player = useRef(null);
  const [currentFormdata, setCurrentFormData] = useState(
    factCheckReview.length > 0 ? factCheckReview[0] : {}
  );

  const updateFormState = (data) => {
    player.current.seekTo(data.start_time, "seconds");
    setCurrentFormData(data);
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
        status: "published",
      },
      analysis: factCheckReview,
    };
    onSubmit(data);
    setCurrent(2);
  };

  return (
    <div style={current === 1 ? { display: "block" } : { display: "none" }}>
      <VideoPlayer
        player={player}
        totalDuration={totalDuration}
        setTotalDuration={setTotalDuration}
        setCurrentStartTime={setCurrentStartTime}
        factCheckReview={factCheckReview}
        videoUrl={summary.url}
        updateFormState={updateFormState}
        setfactCheckReview={setfactCheckReview}
      />
      <div>
        <div style={{ width: "80%" }}>
          <HorizontalTimelineBar
            factCheckReview={factCheckReview}
            setCurrentFormData={updateFormState}
            height={"24px"}
          />
        </div>

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
              setCurrent={setCurrent}
            />
          </div>
        </FactCheckReviewWrapper>
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
        <Button type="primary" onClick={submitFactcheck} style={{ margin: 5 }}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default StepTwo;
