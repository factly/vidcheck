import React, { useState } from "react";
import { LeftCircleFilled, RightCircleFilled } from "@ant-design/icons";
import ReactPlayer from "react-player";
import {
  convertTimeStringToSeconds,
  transformVideoAnalysisdetails,
} from "../analysis/utilities/analysis";

import { HorizontalTimelineBar } from "../analysis/components/AnalysisTimelineBar/AnalysisTimelineBar";
import axios from "axios";
import { VIDEOS_API } from "../../constants/videos";
import { addErrorNotification } from "../../actions/notifications";
import { Result, Skeleton } from "antd";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

function Preview() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const ratingColor = {
    5: "#19b346",
    4: "#8bb38d",
    3: "#b3b3b3",
    2: "#b36d7e",
    1: "#b30a25",
  };

  const [videoData, setVideoData] = useState({});

  const [loading, setLoading] = useState(true);

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

  React.useEffect(() => {
    axios
      .get(VIDEOS_API + "/" + id + "/published")
      .then((response) => {
        setVideoData(response.data);
      })
      .catch((error) => {
        if (id > 0) {
          dispatch(addErrorNotification(error.message));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton />;
  }
  if (!videoData.video) {
    return <Result />;
  }

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
        color: ratingColor[claim.rating.id],
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
          height: "450px",
          marginTop: "20px",
          marginLeft: "auto",
          marginRight: "auto",
          backgroundColor: "#e9ecec",
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
                minHeight: "240px",
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
              <br />
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
      <div
        style={{
          width: "70%",
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: "60px",
        }}
        dangerouslySetInnerHTML={{
          __html: videoData.analysis[currentClaimIndex].html,
        }}
      />
      {videoData.analysis[currentClaimIndex].review_sources ? (
        <div
          style={{
            width: "70%",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "60px",
            backgroundColor: "#e9ecec",
            padding: 12,
          }}
        >
          <h4>Review sources</h4>
          {videoData.analysis[currentClaimIndex].review_sources}
        </div>
      ) : null}
    </div>
  );
}

export default Preview;
