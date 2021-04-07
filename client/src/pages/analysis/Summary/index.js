import React from "react";
import { Typography } from "antd";

function Summary({ data }) {
  const { Title, Paragraph } = Typography;
  return (
    <>
      <Title level={3}>{data.title}</Title>
      <Paragraph>{data.summary}</Paragraph>
    </>
  );
}

export default Summary;
