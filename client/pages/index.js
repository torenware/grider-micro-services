import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import buildClient, { fetcher } from '../api/build-client';

const LandingPage = (props) => {
  //const [oldTickets, setOldTickets] = useState([...prevTickets]);
  const oldTickets = useRef([]);
  const changed = useRef(new Map());

  const setOldTickets = tkts => {
    oldTickets.current = tkts;
  }

  useEffect(() => {
    // Fetch and store old tickets on the
    // tab's sessionStorage.
    const session = window.sessionStorage;
    const retrieved = session.getItem('oldTickets');
    setOldTickets(JSON.parse(retrieved));
    console.log('from session', oldTickets.current);
    if (!oldTickets.current) {
      oldTickets.current = [];
    }
    console.log('number of old tickets', oldTickets.current.length);

    return () => {
      const session = window.sessionStorage;
      console.log('save tickets to storage');
      console.log(oldTickets.current);
      const payload = JSON.stringify(oldTickets.current);
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
        const lookup = oldTickets.current.reduce((map, tkt) => {
          return map.set(tkt.id, tkt);
        }, new Map());
        setOldTickets([...data]);
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
  const props = { tickets, oldTickets: [] };

  return {
    props, // will be passed to the page component as props
  }
}

export default LandingPage;
