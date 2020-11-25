import React from "react";

import { PageWrapper } from "../../../StyledComponents";
import { Steps, Button } from "antd";

import StepOne from "./AnalysisForm/StepOne";
import StepTwo from "./AnalysisForm/StepTwo";
import Preview from "../../preview";

function VideoAnalysisForm({ data, onSubmit }) {
  const [current, setCurrent] = React.useState(0);
  const [summary, setSummary] = React.useState({
    title: data?.video?.title || "",
    summary: data?.video?.summary || "",
    url: data?.video?.url || "",
  });
  return (
    <PageWrapper>
      <Steps current={current} onChange={(value) => setCurrent(value)}>
        <Steps.Step title="Enter video url" />
        <Steps.Step title="Fact Check" />
        <Steps.Step title="Preview" />
      </Steps>
      <StepOne
        current={current}
        setCurrent={setCurrent}
        summary={summary}
        setSummary={setSummary}
      />
      <StepTwo
        current={current}
        summary={summary}
        setSummary={setSummary}
        setCurrent={setCurrent}
        onSubmit={onSubmit}
        data={data}
      />
      <div style={current === 2 ? { display: "block" } : { display: "none" }}>
        <Preview />
        <div style={{ display: "flex", "justify-content": "flex-end" }}>
          <Button type="primary" onClick={() => setCurrent(1)}>
            Previous
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default VideoAnalysisForm;
