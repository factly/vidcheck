import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addClaims } from "../../actions/claims";
import { getVideo, updateVideo } from "../../actions/videos";
import { Skeleton } from "antd";
import EditAnalysisForm from "./index";

function EditAnalysis() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { loading } = useSelector((state) => state.videos.loading);

  const { video } = useSelector(({ videoClaims }) => videoClaims);

  React.useEffect(() => {
    if (video.id !== id) {
      dispatch(getVideo(id)).then((data) =>
        dispatch(addClaims({ video: data.video, claims: data.claims }))
      );
    }
  }, [dispatch, id]);

  if (loading || !video.url) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateVideo(values)).then((res) =>
      history.push(`/preview/${res.video.id}`)
    );
  };

  return <EditAnalysisForm onSubmit={onUpdate} />;
}

export default EditAnalysis;
