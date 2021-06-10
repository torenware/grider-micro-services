import { useState } from 'react';
import Router from 'next/router';
import Image from 'next/image'
import useRequest from '../../hooks/use-request';

const component = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: '/api/users/signup',
    method: 'post',
    body: {
      email,
      password
    },
    onSuccess: () => {
      Router.push('/');
    }
  });

  const onSubmit = async event => {
    event.preventDefault();
    doRequest();
  };

  return (
    <div className='container'>
      <div className='row'>
        <div className='col-4'>
          <Image
            src='/auth-img/ticket-window.jpg'
            className='side-image'
            // width="500"
            alt="Ticket Window"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className='col-8'>
          <form onSubmit={onSubmit}>
            <h1>Sign Up</h1>
            <div className="form-group">
              <label>Email Address</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                className="form-control"
              />
            </div>
            {errors}
            <button className="btn btn-primary">Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );

}

export default component;
