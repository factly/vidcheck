import React from "react";
import { LeftCircleFilled, RightCircleFilled } from "@ant-design/icons";
import ReactPlayer from "react-player";

import HorizontalTimelineBar from "../videos/components/AnalysisTimelineBar/HorizontalTimelineBar";
import { Result, Skeleton } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getVideo } from "../../actions/videos";

function Preview() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const player = React.useRef(null);
  const [currentClaimIndex, setCurrentClaimIndex] = React.useState(0);

  const { videoData, loading } = useSelector((state) => {
    return {
      videoData: state.videos.details[id] ? state.videos.details[id] : null,
      loading: state.videos.loading,
    };
  });

  React.useEffect(() => {
    if (!videoData) dispatch(getVideo(id));
  }, [dispatch]);

  if (loading) {
    return <Skeleton />;
  }

  if (!videoData.video) {
    return <Result />;
  }

  const factCheckReview =
    videoData && videoData.claims && videoData.claims.length > 0
      ? videoData.claims
      : [];

  const handleProgress = () => {
    const currentPlayedTime = player.current.getCurrentTime();
    let index;

    for (index = 0; index < factCheckReview.length; ++index) {
      if (currentPlayedTime < factCheckReview[index].end_time) {
        break;
      }
    }
    setCurrentClaimIndex(index !== factCheckReview.length ? index : index - 1);
  };

  const ratingCount = videoData.claims.reduce((acc, claim) => {
    if (!acc[claim.rating.name]) {
      acc[claim.rating.name] = {
        count: 0,
        color: claim.rating.background_colour.hex,
      };
    }
    acc[claim.rating.name].count += 1;
    return acc;
  }, {});

  const currentClaim = videoData.claims[currentClaimIndex];
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
              playing={true}
              controls={true}
              ref={player}
              volume={0}
              onProgress={handleProgress}
            />
          </div>
          <HorizontalTimelineBar
            player={player}
            totalDuration={videoData.video.total_duration}
            currentClaimIndex={currentClaimIndex}
            factCheckReview={videoData.claims}
            setCurrentClaimIndex={setCurrentClaimIndex}
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
            {videoData.claims.length} claims in total
          </div>
          <HorizontalTimelineBar
            totalDuration={videoData.video.total_duration}
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
                  : player.current.seekTo(
                      videoData.claims[currentClaimIndex - 1].start_time
                    )
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
                borderColor: currentClaim.rating.background_colour.hex,
                backgroundColor: "#fff",
                padding: "20px",
                minHeight: "240px",
                maxHeight: "320px",
                overflow: "auto",
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
                  {currentClaimIndex + 1} of {videoData.claims.length} claims
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    textTransform: "uppercase",
                    color: currentClaim.rating.background_colour.hex,
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
                    color: currentClaim.rating.background_colour.hex,
                  }}
                >
                  {videoData.claims[currentClaimIndex].fact}
                </div>
              </div>
            </div>
            <div
              style={{ padding: 20 }}
              onClick={() =>
                currentClaimIndex === videoData.claims.length - 1
                  ? null
                  : player.current.seekTo(
                      videoData.claims[currentClaimIndex + 1].start_time
                    )
              }
            >
              <RightCircleFilled
                style={{
                  fontSize: 30,
                  color:
                    currentClaimIndex === videoData.claims.length - 1
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
          __html: videoData.claims[currentClaimIndex].html_description,
        }}
      />
      {videoData.claims[currentClaimIndex].review_sources ? (
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
          <ul>
            {videoData.claims[currentClaimIndex].review_sources.map((each) => (
              <li>
                <a style={{ color: "inherit" }} href={each.url}>
                  {each.description}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default Preview;
