import React from "react";
import { SketchPicker } from "react-color";

function ColorPicker({ onChange, value }) {
  return <SketchPicker onChangeComplete={onChange} color={value} />;
}

export default ColorPicker;
