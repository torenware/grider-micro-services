import { useState } from 'react';
import Router from 'next/router';
import { mutate } from 'swr';
import useRequest from '../../hooks/use-request';
import enforceLogin from '../../utils/redirect-to-login';

const NewTicket = ({ currentUser, addFlash }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  enforceLogin(currentUser);

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price
    },
    onSuccess: () => {
      // Set a flash message and invalidate the swr cache
      // for the tickets object.
      addFlash(`Sold ticket for "${title}"`);
      mutate('/api/tickets');
      Router.push('/');
    }
  });

  const onBlur = () => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return; // let the server handle this.
    }
    setPrice(value.toFixed(2));

  }

  const onSubmit = async event => {
    event.preventDefault();
    doRequest();
  };

  return (
    <div>
      <h1>Create A Ticket</h1>
      <form onSubmit={onSubmit} >
        <div className="form-group">
          <label>Title</label>
          <input
            value={title} className="form-control" onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price} className="form-control" onBlur={onBlur} onChange={e => setPrice(e.target.value)}
          />
        </div>
        <button className="btn btn-primary">Save</button>
      </form>
      {errors}
    </div>
  );
};

NewTicket.getInitialProps = async (context) => {
  return {};
}

export default NewTicket;
