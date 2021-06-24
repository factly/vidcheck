import React from 'react';
import SpacePermissionEditForm from './components/PermissionForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateSpacePermission, getSpaces } from '../../../actions/spacePermissions';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../../components/ErrorsAndImage/RecordNotFound';

function EditSpacePermission() {
  const history = useHistory();
  const { oid, pid } = useParams();

  const dispatch = useDispatch();

  const { space, loading } = useSelector((state) => {
    return {
      space: state.spaces.details[oid] ? state.spaces.details[oid] : null,
      loading: state.spaces.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch, oid, pid]);

  if (loading) return <Skeleton />;

  if (!space) {
    return <RecordNotFound />;
  }

  const onUpdate = (values) => {
    dispatch(updateSpacePermission({ ...space.permission, ...values })).then(() =>
      history.push('/permissions/spaces'),
    );
  };

  return <SpacePermissionEditForm data={space.permission} onCreate={onUpdate} />;
}

export default EditSpacePermission;
