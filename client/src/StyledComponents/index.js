import styled from "styled-components";

/** Timeline bar */
export const VideoAnalysisTimelineBarWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

export const VideoLengthBar = styled.div`
  width: 65%;
  color: white;
  text-align: center;
  display: flex;
`;

export const VideoLengthPart = styled.div`
  width: ${(props) => props.width};
  height: 100%;
  background-color: ${(props) => props.backgroundColor};
  float: left;
  display: flex;
  align-items: center;
  border-radius: 8px;
  justify-content: center;
`;

export const FactCheckReviewListWrapper = styled.div`
  padding: 20px;
  min-width: 40%;
`;

export const TimelineWrapper = styled.div``;

/**   createupdate analysis */
export const PageWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-content: space-around;
`;

export const VideoInfoParentWrapper = styled.div`
  padding: 20px;
  display: flex;
  align-content: space-around;
  justify-content: center;
`;

export const FactCheckReviewWrapper = styled.div`
  padding: 20px;
  width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
`;

/** Analysis form */

export const FactCheckReviewFormWrapper = styled.div`
  padding: 20px;
  background: azure;
  min-width: 30%;
  display: flex;
  align-content: space-around;
  justify-content: center;
`;

/** Info wrappers */
export const VideoInfoWrapper = styled.div`
  padding-left: 1%;
  min-width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

export const InfoWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const InfoHeaderWrapper = styled.span`
  min-width: 30%;
`;