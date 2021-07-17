import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { addClaims, resetClaim } from "../../actions/claims";
import { getVideo, updateVideo } from "../../actions/videos";
import { Skeleton } from "antd";
import EditFactCheckForm from "./components/Form/index";

function EditFactCheck() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { loading } = useSelector((state) => state.videos.loading);

  const { video } = useSelector(({ videoClaims }) => videoClaims);

  React.useEffect(() => {

    dispatch(getVideo(id)).then((data) =>
      dispatch(addClaims({ video: data.video, claims: data.claims }))
    );

  }, [dispatch]);

  if (loading || !video.url) return <Skeleton />;

  const onUpdate = (values) => {
    dispatch(updateVideo(values)).then((res) => {
      if (res?.video?.id) {
        dispatch(resetClaim())
        history.push(`/fact-checks/${res.video.id}/preview`)
      }
    }
    );
  };

  return <EditFactCheckForm onSubmit={onUpdate} />;
}

export default EditFactCheck;
