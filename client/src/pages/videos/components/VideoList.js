import React from "react";
import { List, Space } from "antd";
import VideoAnalysisCard from "./VideoAnalysisCard";

function VideoList({ videos, loading, total, filters, setFilters, onDeleteVideo }) {
  return (
    <Space direction="vertical">
      <List
        bordered
        className="post-list"
        loading={loading}
        itemLayout="vertical"
        dataSource={videos}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <VideoAnalysisCard data={item} onDeleteVideo={onDeleteVideo} key={index} />
          </List.Item>
        )}
      ></List>
    </Space>
  );
}

export default VideoList;
