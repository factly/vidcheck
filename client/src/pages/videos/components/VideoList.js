import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { List, Space } from "antd";
import deepEqual from "deep-equal";
import VideoAnalysisCard from "./VideoAnalysisCard";
import { getVideos } from "../../../actions/videos";

function VideoList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
  });
  const { videos, loading, total } = useSelector(({ videos }) => {
    const node = videos.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        videos: node.data.map((element) => videos.details[element]),
        total: node.total,
        loading: videos.loading,
      };
    return { videos: [], total: 0, loading: videos.loading };
  });

  React.useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchVideos = () => {
    dispatch(getVideos(filters));
  };

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
        renderItem={(item) => (
          <List.Item>
            <VideoAnalysisCard data={item} />
          </List.Item>
        )}
      ></List>
    </Space>
  );
}

export default VideoList;
