import React from "react";
import PropTypes from "prop-types";
import {Typography} from "antd";

const { Title } = Typography;
function Summary({data}) {
    return (
        <>
            <Title level={3}>{data.title}</Title>
            <Title level={4}>{data.summary}</Title>
        </>

    );
}

Summary.protoTypes = {
    data: PropTypes.object.isRequired,
};
export default Summary;
