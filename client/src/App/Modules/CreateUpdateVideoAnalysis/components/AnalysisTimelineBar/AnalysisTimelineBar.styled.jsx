import styled from "styled-components";

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
