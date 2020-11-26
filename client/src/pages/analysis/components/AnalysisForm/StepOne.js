import { Button, Input } from "antd";
import React from "react";

function StepOne({ current, summary, setSummary, setCurrent }) {
  return (
    <div style={current === 0 ? { display: "block" } : { display: "none" }}>
      <div style={{ marginTop: 16, width: "70%" }}>
        <Input
          addonBefore={"Title"}
          placeholder={"Enter title"}
          defaultValue={summary.title ? summary.title : ""}
          onChange={(e) => setSummary({ ...summary, title: e.target.value })}
        />
      </div>
      <div style={{ marginTop: 16, width: "70%", display: "flex" }}>
        {/* <div className="ant-input-group-addon">Summary</div> */}
        <div
          style={{
            border: "1px solid #d9d9d9",
            padding: "0 11px",
            fontWeight: "normal",
            fontSize: 14,
            textAlign: "center",
            backgroundColor: "#fafafa",
          }}
        >
          <p>Summary</p>
        </div>
        <Input.TextArea
          addonBefore={"Summary"}
          defaultValue={summary.summary ? summary.summary : ""}
          onChange={(e) => setSummary({ ...summary, summary: e.target.value })}
        />
      </div>
      <div style={{ marginTop: 16, width: "70%" }}>
        <Input
          addonBefore={"URL"}
          placeholder={"Paste url here"}
          defaultValue={summary.url ? summary.url : ""}
          onChange={(e) => setSummary({ ...summary, url: e.target.value })}
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
