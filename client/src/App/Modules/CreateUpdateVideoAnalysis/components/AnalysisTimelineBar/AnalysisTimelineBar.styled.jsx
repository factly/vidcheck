import styled from "styled-components";

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

export const VideoAnalysisTimelineBarWrapper = styled.div`
    display: flex;
    justify-content: center;
`

export const VideoLengthBar = styled.div`
    width: 65%;
    height: 30px;
    background-color: #b3b3b3;
    color: white;
    text-align: center;
    display: flex;
    justify-content: center;
    `;

export const VideoLengthPart = styled.div`
    width: ${props => props.width};
    height: 100%;
    background-color: ${props => props.backgroundColor};
    float: left;
    `;

export const FactCheckReviewWrapper = styled.div`
    padding: 20px; 
    display: flex;
    align-content: space-around;
    justify-content: center;
`;

export const FactCheckReviewListWrapper = styled.div`
    padding: 20px; 
    min-width: 40%;
`;


export const FactCheckReviewFormWrapper = styled.div`
    padding: 20px; 
    background: azure;
    min-width: 30%;
    display: flex;
    align-content: space-around;
    justify-content: center;
`;
