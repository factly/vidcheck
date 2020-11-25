import { Button } from "antd";
import React from "react";
import SummaryForm from "../SummaryForm";

function StepOne({ current, summary, setSummary, setCurrent }) {
  return (
    <div style={current === 0 ? { display: "block" } : { display: "none" }}>
      <SummaryForm summary={summary} setSummary={setSummary} />

      <div style={{ display: "flex", "justify-content": "flex-end" }}>
        <Button type="primary" onClick={() => setCurrent(1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default StepOne;
