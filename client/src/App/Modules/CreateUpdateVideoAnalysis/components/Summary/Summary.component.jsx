import React from "react";
import PropTypes from "prop-types";

function Summary({ data }) {
  return (
    <>
      <div>{data.title}</div>
      <div>{data.summary}</div>
    </>
  );
}

Summary.protoTypes = {
  data: PropTypes.object.isRequired,
};
export default Summary;
