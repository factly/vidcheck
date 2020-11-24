import { Col, Row, Space, Card } from "antd";
import React from "react";
import ReactPlayer from "react-player";
import { HorizontalTimelineBar } from "../analysis/components/AnalysisTimelineBar/AnalysisTimelineBar";
import {
  convertTimeStringToSeconds,
  transformVideoAnalysisdetails,
} from "../analysis/utilities/analysis";

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
        claim: "False",
        fact: "False",
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
        claim: "Misleading",
        fact: "Misleading",
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
        claim: "Partly True",
        fact: "Partly True",
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
        claim: "True",
        fact: "True",
        end_time: 292,
        start_time: 209,
        end_time_fraction: 0.9898305084745763,
      },
    ],
  };
  const [currentStartTime, setCurrentStartTime] = React.useState(null);
  const player = React.useRef(null);
  const [playing, setPlaying] = React.useState(true);
  const [played, setPlayed] = React.useState(0);
  const [currentFormdata, setCurrentFormData] = React.useState({});
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

  console.log({ ratingCount });

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
            disabled={true}
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
    </div>
  );
}

export default Preview;
