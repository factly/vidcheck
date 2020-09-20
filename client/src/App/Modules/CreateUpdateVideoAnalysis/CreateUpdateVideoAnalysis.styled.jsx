import styled from "styled-components";
import {Input} from "antd";

export const Player = styled.div`
    position: relative;
    padding-top: 56.25% 
    `;

export const ReactPlayerDiv = styled.div`
position: absolute;
  top: 0;
  left: 0;
  `;

export const VideoUrlInput = styled(Input)`
    min_width: 200em 
`;

export const VideoLengthBar = styled.div`
    width: 100%;
    height: 30px;
    border-radius: 10px;
    background-color: #b3b3b3;
    color: white;
    text-align: center;
    `;

export const VideoLengthPart = styled.div`
    width: ${props => props.width};
    height: 100%;
    background-color: ${props => props.backgroundColor};
    float: left;
    `;