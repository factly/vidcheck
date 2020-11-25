import React from "react";
import { LeftCircleFilled, RightCircleFilled } from "@ant-design/icons";
import ReactPlayer from "react-player";
import {
  convertTimeStringToSeconds,
  transformVideoAnalysisdetails,
} from "../analysis/utilities/analysis";

import { HorizontalTimelineBar } from "../analysis/components/AnalysisTimelineBar/AnalysisTimelineBar";

function Preview() {
  const ratingColor = {
    1: "#19b346",
    2: "#8bb38d",
    3: "#b3b3b3",
    4: "#b36d7e",
    5: "#b30a25",
  };
  const videoData = {
    video: {
      id: 1,
      created_at: "2020-11-23T05:50:01.336246Z",
      updated_at: "2020-11-23T12:27:17.903399Z",
      deleted_at: null,
      url: "https://www.youtube.com/watch?v=2Opid0P1P_I",
      title:
        "Explainer: What are the directions by Courts & Tribunals about bursting firecrackers during festivals & celebrations?",
      summary:
        "It is that time of the year when there is an intense debate around the directions by courts regarding bursting firecrackers. We take a look at the Supreme Court order of 2018 & the recent NGT order that laid down guidelines for bursting firecrackers during any celebration. ",
      video_type: "www.youtube.com",
      space_id: 1,
    },
    analysis: [
      {
        id: 1,
        created_at: "2020-11-23T05:50:01.348783Z",
        updated_at: "2020-11-23T12:27:17.907896Z",
        deleted_at: null,
        video_id: 1,
        video: null,
        rating_id: 5,
        rating: {
          id: 5,
          created_at: "2020-11-23T05:47:42.731056Z",
          updated_at: "2020-11-23T05:47:42.731056Z",
          deleted_at: null,
          name: "False",
          slug: "false",
          description: "False",
          numeric_value: 1,
          space_id: 1,
        },
        claim:
          "India generated the 3rd highest volume of E-waste even as its per capita generation is 1/3rd the Global Average",
        fact:
          "With the generation of E-waste increasing every year, it is soon becoming an important environmental issue around the world. India generated the 3rd highest volume of E-waste in 2019, behind China & USA as per the Global E-waste Monitor. ",
        end_time: 16,
        start_time: 0,
        end_time_fraction: 0.05423728813559322,
      },
      {
        id: 3,
        created_at: "2020-11-23T05:50:01.348783Z",
        updated_at: "2020-11-23T12:27:17.911846Z",
        deleted_at: null,
        video_id: 1,
        video: null,
        rating_id: 3,
        rating: {
          id: 3,
          created_at: "2020-11-23T05:47:42.731056Z",
          updated_at: "2020-11-23T05:47:42.731056Z",
          deleted_at: null,
          name: "Misleading",
          slug: "misleading",
          description: "Misleading",
          numeric_value: 3,
          space_id: 1,
        },
        claim:
          "Review: What is the latest on the COVID-19 Vaccine development?",
        fact:
          "At least eleven (11) COVID-19 vaccine candidates are in phase-3 of clinical trials. Multiple companies have announced encouraging results through preliminary analysis. Pfizer & BioNTech have already applied to US FDA for emergency use authorization (EUA).  ",
        end_time: 161,
        start_time: 16,
        end_time_fraction: 0.5457627118644067,
      },
      {
        id: 4,
        created_at: "2020-11-23T05:50:01.348783Z",
        updated_at: "2020-11-23T12:27:17.912689Z",
        deleted_at: null,
        video_id: 1,
        video: null,
        rating_id: 2,
        rating: {
          id: 2,
          created_at: "2020-11-23T05:47:42.731056Z",
          updated_at: "2020-11-23T05:47:42.731056Z",
          deleted_at: null,
          name: "Partly True",
          slug: "partly-true",
          description: "Partly True",
          numeric_value: 4,
          space_id: 1,
        },
        claim:
          "Data: NOTA polled more votes than the margin of victory in 30 constituencies of Bihar",
        fact:
          "The overall NOTA vote share in the 2020 Bihar Assembly elections decreased to 1.68% compared to 2.46% in 2015. This decrease in the NOTA vote share is consistent with the overall trend of declining preference for NOTA. ",
        end_time: 209,
        start_time: 161,
        end_time_fraction: 0.7084745762711865,
      },
      {
        id: 5,
        created_at: "2020-11-23T05:50:01.348783Z",
        updated_at: "2020-11-23T12:27:17.913573Z",
        deleted_at: null,
        video_id: 1,
        video: null,
        rating_id: 1,
        rating: {
          id: 1,
          created_at: "2020-11-23T05:47:42.731056Z",
          updated_at: "2020-11-23T05:47:42.731056Z",
          deleted_at: null,
          name: "True",
          slug: "true",
          description: "True",
          numeric_value: 5,
          space_id: 1,
        },
        claim:
          "Review: What do the SC Guidelines say about granting Maintenance to Wife & Children?",
        fact:
          "While hearing an appeal on an issue related to grant of maintenance, the Supreme Court recently laid down guidelines for lower courts to decide on such cases. Among other things, the SC directed that information be filed by both parties in a prescribed format. Here is a review of these guidelines.",
        end_time: 292,
        start_time: 209,
        end_time_fraction: 0.9898305084745763,
      },
    ],
  };
  const [currentStartTime, setCurrentStartTime] = React.useState(null);
  const player = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [played, setPlayed] = React.useState(0);
  const [currentFormdata, setCurrentFormData] = React.useState({});
  const [currentClaimIndex, setCurrentClaimIndex] = React.useState(0);
  const [totalDuration, setTotalDuration] = React.useState(0);
  const [loopDetails, setLoopDetails] = React.useState({
    loopEnabled: false,
    startFraction: 0,
    endFraction: 1,
  });

  const updateFormState = (data) => {
    setPlayed(data.end_time_fraction);
    player.current.seekTo(
      convertTimeStringToSeconds(data.start_time),
      "seconds"
    );
    setCurrentFormData(data);
    const claimIndex = videoData.analysis.findIndex(
      (item) => item.id === data.id
    );
    setCurrentClaimIndex(claimIndex);
  };
  const factCheckReview =
    videoData && videoData.analysis && videoData.analysis.length > 0
      ? transformVideoAnalysisdetails(videoData).analysis
      : [];

  const handleProgress = () => {
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
  };

  const ratingCount = videoData.analysis.reduce((acc, claim) => {
    if (!acc[claim.rating.name]) {
      acc[claim.rating.name] = {
        count: 0,
        color: ratingColor[claim.rating.numeric_value],
      };
    }
    acc[claim.rating.name].count += 1;
    return acc;
  }, {});

  const currentClaim = videoData.analysis[currentClaimIndex];
  return (
    <div style={{}}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          width: "70%",
          marginTop: "20px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <ReactPlayer
              url={videoData.video.url}
              playing={playing}
              controls={true}
              ref={player}
              volume={0}
              onProgress={handleProgress}
              onDuration={setTotalDuration}
            />
          </div>
          <HorizontalTimelineBar
            factCheckReview={factCheckReview}
            setCurrentFormData={updateFormState}
            currentFormdata={currentFormdata}
          />
        </div>
        <div
          style={{
            height: "420px",
            boxShadow: "0px 0px 9px 1px grey",
            borderRadius: "5px",
            width: "260px",
            padding: "20px",
            paddingTop: "4px",
            overflowX: "auto",
            backgroundColor: "#fff",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              marginTop: "6px",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
          >
            {videoData.analysis.length} claims in total
          </div>
          <HorizontalTimelineBar
            factCheckReview={factCheckReview}
            height={"12px"}
          />
          <div
            style={{
              fontSize: "12px",
              marginTop: "6px",
            }}
          >
            {Object.keys(ratingCount).map((rating) => (
              <div
                style={{
                  color: ratingCount[rating].color,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {ratingCount[rating].count} {rating}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: "18px",
              marginTop: "6px",
            }}
          >
            {videoData.video.summary}
          </div>
        </div>
      </div>
      <br />
      <div
        style={{
          alignItems: "center",
          justifyContent: "space-around",
          width: "70%",
          height: "360px",
          marginTop: "20px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#ccc",
          marginTop: -120,
        }}
      >
        <div style={{ height: 60 }}></div>
        {currentClaimIndex > -1 && currentClaim && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{ padding: 20 }}
              onClick={() =>
                currentClaimIndex === 0
                  ? null
                  : updateFormState(factCheckReview[currentClaimIndex - 1])
              }
            >
              <LeftCircleFilled
                style={{
                  fontSize: 30,
                  color: currentClaimIndex === 0 ? "#ddd" : "#222",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                boxShadow: "0px 0px 9px 1px grey",
                borderStyle: "solid",
                borderWidth: "2px",
                borderRadius: "6px",
                borderColor: ratingColor[currentClaim.rating.numeric_value],
                backgroundColor: "#fff",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ fontSize: "12px", textTransform: "uppercase" }}>
                  {currentClaimIndex + 1} of {videoData.analysis.length} claims
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    textTransform: "uppercase",
                    color: ratingColor[currentClaim.rating.numeric_value],
                  }}
                >
                  {currentClaim.rating.name}
                </div>
              </div>
              <div stle={{ height: "40%", margin: 10, overflowX: "auto" }}>
                <h4>Claim:</h4>
                {currentClaim.claim}
              </div>
              <div stle={{ height: "40%", margin: 10, overflowX: "auto" }}>
                <h4>Fact:</h4>
                <div
                  style={{
                    color: ratingColor[currentClaim.rating.numeric_value],
                  }}
                >
                  {currentClaim.fact}
                </div>
              </div>
            </div>
            <div
              style={{ padding: 20 }}
              onClick={() =>
                currentClaimIndex === videoData.analysis.length - 1
                  ? null
                  : updateFormState(factCheckReview[currentClaimIndex + 1])
              }
            >
              <RightCircleFilled
                style={{
                  fontSize: 30,
                  color:
                    currentClaimIndex === videoData.analysis.length - 1
                      ? "#ddd"
                      : "#222",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Preview;
