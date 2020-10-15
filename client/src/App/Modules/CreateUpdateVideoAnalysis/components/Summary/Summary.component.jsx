import React from "react";
import PropTypes from "prop-types";
import {Typography} from "antd";

const { Title, Paragraph, Text } = Typography;
function Summary({data}) {
    return (
        <>
            <Title level={3}>{data.title}</Title>
            <Paragraph>{data.summary}</Paragraph>
        </>

    );
}

Summary.protoTypes = {
    data: PropTypes.object.isRequired,
};
export default Summary;
