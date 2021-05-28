import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import lodash from 'lodash';
import useSWR from 'swr';
import buildClient, { fetcher } from '../api/build-client';

const LandingPage = (props) => {

  const { data: tickets, errors } = useSWR(
    '/api/tickets',
    fetcher,
    {
      initialData: props.tickets,
      refreshInterval: 20 * 1000,
      onSuccess: (data) => {
        console.log(`Records fetched: ${data.length}`);
      },
    }
  )

  const rows = tickets.map(ticket => {
    const detailUri = `/tickets/${ticket.id}`;
    const link = (<Link href={detailUri}><a>{ticket.title}</a></Link>);
    return (
      <div className='row' id={ticket.id} key={ticket.id}>
        <div className="col-sm"><label>Number:</label>{ticket.serial}</div>
        <div className="col-sm"><label>Title:</label>{link}</div>
        <div className="col-sm"><label>Price:</label>${ticket.price.toFixed(2)}</div>
        <div className="col-sm"><label>Available?</label><span className='status'>{ticket.status}</span></div>
      </div>
    );
  });
  return (
    <div>
      <h1>Tickets Up For Sale on GitTix</h1>
      <div className="container tickets">
        {rows}
      </div>

    </div>
  );
};


export async function getServerSideProps(context) {
  const client = buildClient(context);
  const { data: tickets } = await client.get('/api/tickets');
  return {
    props: { tickets }, // will be passed to the page component as props
  }
}

export default LandingPage;
