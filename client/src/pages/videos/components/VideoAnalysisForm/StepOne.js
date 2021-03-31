import { Button, Input } from "antd";
import React from "react";

function StepOne({ current, summary, setSummary, setCurrent }) {
  return (
    <div style={current === 0 ? { display: "block" } : { display: "none" }}>
      <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
        <div
          style={{
            border: "1px solid #d9d9d9",
            padding: "11px",
            fontWeight: "normal",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#fafafa",
            width: "20%",
          }}
        >
          Title
        </div>
        <Input
          placeholder={"Enter title"}
          defaultValue={summary.title ? summary.title : ""}
          onChange={(e) => setSummary({ ...summary, title: e.target.value })}
        />
      </div>
      <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
        <div
          style={{
            border: "1px solid #d9d9d9",
            padding: "11px",
            fontWeight: "normal",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#fafafa",
            width: "20%",
          }}
        >
          URL
        </div>
        <Input
          placeholder={"Paste url here"}
          defaultValue={summary.url ? summary.url : ""}
          onChange={(e) => setSummary({ ...summary, url: e.target.value })}
        />
      </div>
      <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
        <div
          style={{
            border: "1px solid #d9d9d9",
            paddingTop: "11px",
            fontWeight: "normal",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#fafafa",
            width: "20%",
          }}
        >
          Excerpt
        </div>
        <Input.TextArea
          autoSize={{ minRows: 6, maxRows: 30 }}
          defaultValue={summary.summary ? summary.summary : ""}
          onChange={(e) => setSummary({ ...summary, summary: e.target.value })}
        />
      </div>

      <div style={{ display: "flex", "justify-content": "flex-end" }}>
        <Button
          type="primary"
          onClick={() => {
            setCurrent(1);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default StepOne;
