import React from 'react';
import { addPolicy } from '../../actions/policies';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PolicyCreateForm from './components/PolicyForm';

function CreatePolicy() {
  const history = useHistory();

  const dispatch = useDispatch();
  const onCreate = (values) => {
    values.users = values.users.map((item) => item.toString());
    values.permissions = values.permissions.filter(
      (item) => item && item.resource && item.actions.length > 0,
    );
    dispatch(addPolicy(values)).then(() => history.push('/policies'));
  };

  return <PolicyCreateForm onCreate={onCreate} />;
}

export default CreatePolicy;
