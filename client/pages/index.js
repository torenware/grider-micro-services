import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import buildClient, { fetcher } from '../api/build-client';

const LandingPage = (props) => {

  const getOldTicketsFromStorage = () => {
    if (typeof window === 'undefined') {
      return [];
    }
    const session = window.sessionStorage;
    let val = [];
    if (session.getItem('oldTickets')) {
      const retrieved = session.getItem('oldTickets');
      val = JSON.parse(retrieved);
    }
    return val;
  }
  // Use both here because we need to trigger redraws (so state),
  // but state is gone by the time the component tears down, so ref too.
  const [oldTickets, setOldTickets] = useState(getOldTicketsFromStorage());
  const oldTicketsRef = useRef(oldTickets);
  const changed = useRef(new Map());

  const setOldTicketsWithRef = tkts => {
    setOldTickets(tkts);
    oldTicketsRef.current = tkts;
  }

  useEffect(() => {
    // Fetch and store old tickets on the
    // tab's sessionStorage.
    console.log('from session', oldTickets);
    console.log('number of old tickets', oldTickets.length);

    return () => {
      const session = window.sessionStorage;
      console.log('save tickets to storage');
      console.log(oldTicketsRef.current);
      const payload = JSON.stringify(oldTicketsRef.current);
      session.setItem('oldTickets', payload);
    };
  }, []);


  const { data: tickets, errors } = useSWR(
    '/api/tickets',
    fetcher,
    {
      // initialData: props.tickets,
      refreshInterval: 20 * 1000,
      onSuccess: (data) => {
        changed.current.clear();
        const lookup = oldTickets.reduce((map, tkt) => {
          return map.set(tkt.id, tkt);
        }, new Map());
        setOldTicketsWithRef(data);
        data.map(tkt => {
          if (lookup.has(tkt.id)) {
            const oldTkt = lookup.get(tkt.id);
            if (oldTkt.status !== tkt.status) {
              changed.current.set(tkt.id, tkt.status);
            }
          }
        });
        console.log(`Records fetched: ${data.length}, ${changed.current.size} updated.`);
      },
    }
  )

  const ticks = tickets || props.tickets;
  const rows = ticks.map(ticket => {
    const detailUri = `/tickets/${ticket.id}`;
    const link = (<Link href={detailUri}><a>{ticket.title}</a></Link>);
    const spanClass = changed.current.has(ticket.id) ? 'status emphasize' : 'status';
    return (
      <div className='row' id={ticket.id} key={ticket.id}>
        <div className="col-sm"><label>Number:</label>{ticket.serial}</div>
        <div className="col-sm"><label>Title:</label>{link}</div>
        <div className="col-sm"><label>Price:</label>${ticket.price.toFixed(2)}</div>
        <div className="col-sm">
          <label>Available?</label>
          <span className={spanClass}>
            {ticket.status}
          </span>
        </div>
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
  const date = new Date().toLocaleTimeString();
  console.log(`${date}: retrieved ${tickets.length} records`);
  const props = { tickets };

  return {
    props, // will be passed to the page component as props
  }
}

export default LandingPage;
