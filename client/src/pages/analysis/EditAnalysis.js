import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addAnalysis } from "../../actions/analysis";
import { getVideo, updateVideo } from "../../actions/videos";
import { Skeleton } from "antd";
import EditAnalysisForm from "./index";

function EditAnalysis() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { loading } = useSelector((state) => state.videos.loading);

  const { video } = useSelector(({ analysis }) => analysis);

  React.useEffect(() => {
    dispatch(getVideo(id)).then((data) =>
      dispatch(addAnalysis({ video: data.video, claims: data.analysis }))
    );
  }, [dispatch, id]);

  if (loading || !video.url) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateVideo(values)).then(() => history.push("/"));
  };

  return <EditAnalysisForm onSubmit={onUpdate} />;
}

export default EditAnalysis;
