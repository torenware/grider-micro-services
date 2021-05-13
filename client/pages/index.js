import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

const LandingPage = (props) => {
  const [tickets, setTickets] = useState(props.tickets);
  // @see https://daviseford.com/blog/2019/07/11/react-hooks-check-if-mounted.html
  const componentIsMounted = useRef(true);
  useEffect(async () => {
    const client = axios.create({
      baseURL: '/',
    });
    const timer = setInterval(async () => {
      const fetched = await getInitialProps(null, client, props.currentUser);
      if (componentIsMounted.current) {
        setTickets(fetched.tickets);
      }
    }, 20 * 1000);

    // remove timer on page teardown.
    return () => {
      componentIsMounted.current = false;
      clearInterval(timer);
    };
  }, [tickets]);
  const rows = tickets.map(ticket => {
    const detailUri = `/tickets/${ticket.id}`;
    const link = (<Link href={detailUri}><a>{ticket.title}</a></Link>);
    return (
      <div className='row' key={ticket.id}>
        <div className="col-sm"><label>Number:</label>{ticket.serial}</div>
        <div className="col-sm"><label>Title:</label>{link}</div>
        <div className="col-sm"><label>Price:</label>${ticket.price.toFixed(2)}</div>
        <div className="col-sm"><label>Available?</label>{ticket.status}</div>
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

//The static method getInitialProps(), if present, gets called before 
// rendering, the results getting passed down to components as they render
// as props.

const getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
}

LandingPage.getInitialProps = getInitialProps;

export default LandingPage;
