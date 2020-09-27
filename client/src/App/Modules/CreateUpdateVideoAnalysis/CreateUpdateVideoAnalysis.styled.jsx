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

export const VideoLengthBar = styled.div`
    padding: 20px;
    width: 60%;
    height: 30px;
    border-radius: 10px;
    background-color: #b3b3b3;
    display: flex;
    justify-content: flex-start;
    `;

export const VideoLengthPart = styled.div`
    width: ${props => props.width};
    height: 100%;
    background-color: ${props => props.backgroundColor};
    `;

export const FactCheckReviewWrapper = styled.div`
    padding: 20px; 
    display: flex;
    align-content: space-around;
    justify-content: center;
`;

export const FactCheckReviewListWrapper = styled.div`
padding: 20px; 
    min-width: 30%;
`;


export const FactCheckReviewFormWrapper = styled.div`
    padding: 20px; 
    background: azure;
    min-width: 30%;
    display: flex;
    align-content: space-around;
    justify-content: center;
`;
