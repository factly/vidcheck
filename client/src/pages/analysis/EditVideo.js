import React from "react";
import VideoEditForm from "./components/VideoAnalysisForm";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "antd";
import { updateVideo, getVideo } from "../../actions/videos";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";

function EditVideo() {
  const history = useHistory();
  const { id } = useParams();

  const dispatch = useDispatch();

  const { data, loading } = useSelector((state) => {
    return {
      data: state.videos.details[id] ? state.videos.details[id] : null,
      loading: state.videos.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getVideo(id));
  }, [dispatch, id]);

  if (loading && !data) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(
      updateVideo({
        video: { ...data.video, ...values.video },
        analysis: values.analysis,
      })
    ).then(() => history.push("/"));
  };

  return <VideoEditForm data={data} onSubmit={onUpdate} />;
}

export default EditVideo;
