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