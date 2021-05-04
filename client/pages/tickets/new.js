import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const NewTicket = ({ currentUser, addFlash }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price
    },
    onSuccess: () => {
      addFlash('New ticket created');
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
    console.log('submit called');
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
            value={price} className="form-control" onChange={e => setPrice(e.target.value)}
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
