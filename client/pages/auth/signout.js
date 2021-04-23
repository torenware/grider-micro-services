import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const component = (props) => {
  const { doRequest, errors } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => {

      Router.push('/');
    }
  });

  useEffect(() => {
    doRequest();
  }, [])


  return <em>Signing out...</em>;

}

export default component;
