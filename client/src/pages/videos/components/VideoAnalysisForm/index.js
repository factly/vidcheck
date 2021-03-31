import React from "react";

import { PageWrapper } from "../../../../StyledComponents";
import { Steps, Button } from "antd";

import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Preview from "../../../preview";
import { useHistory } from "react-router-dom";

function VideoAnalysisForm({ data, onSubmit, vid }) {
  const history = useHistory();
  const [current, setCurrent] = React.useState(0);
  const [summary, setSummary] = React.useState({
    title: data?.video?.title || "",
    summary: data?.video?.summary || "",
    url: data?.video?.url || "",
  });
  return (
    <PageWrapper>
      <Steps current={current}>
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
        <Preview vid={vid} />
        <div style={{ display: "flex", "justify-content": "flex-end" }}>
          <Button
            type="primary"
            onClick={() => setCurrent(1)}
            style={{ marginRight: 5 }}
          >
            Previous
          </Button>

          <Button type="primary" onClick={() => history.push("/")}>
            Publish
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}

export default VideoAnalysisForm;
