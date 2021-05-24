import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import lodash from 'lodash';

const LandingPage = (props) => {
  const [tickets, setTickets] = useState(props.tickets);
  const mounted = useRef(true);
  const lastChange = useRef(tickets);
  // @see https://daviseford.com/blog/2019/07/11/react-hooks-check-if-mounted.html
  // const componentIsMounted = useRef(true);
  // useEffect(async () => {
  //   const client = axios.create({
  //     baseURL: '/',
  //   });
  //   const timer = setInterval(async () => {
  //     const fetched = await getInitialProps(null, client, props.currentUser);
  //     if (componentIsMounted.current) {
  //       setTickets([]);
  //       setTickets(fetched.tickets);
  //     }
  //   }, 20 * 1000);

  //   // remove timer on page teardown.
  //   return () => {
  //     componentIsMounted.current = false;
  //     clearInterval(timer);
  //   };
  // }, [tickets]);

  useEffect(() => {
    const source = axios.CancelToken.source();
    const client = axios.create({
      baseURL: '/',
      cancelToken: source.token,

    });
    mounted.current = true;
    const retouchDOM = async () => {
      const fetched = await getInitialProps(null, client, props.currentUser);
      const lastCycle = lastChange.current;
      let thisCycle = fetched.tickets;
      // No change, no reason to touch DOM.
      if (lodash.isEqual(thisCycle, lastCycle)) {
        console.log('no change');
        console.log('mounted?', mounted.current);
        return;
      }
      else {
        console.log('mounted?', mounted.current);
        console.log('last', lastCycle);
        console.log('this', thisCycle);
      }
      lastChange.current = fetched.tickets;
      fetched.tickets.map(tkt => {
        if (mounted.current) {
          setTickets(fetched.tickets);
        }
      });
    };
    const timer = setInterval(() => {
      if (mounted.current) {
        retouchDOM();
      }
    }, 20 * 1000);

    retouchDOM();

    // remove timer on page teardown.
    return () => {
      mounted.current = false;
      clearInterval(timer);
      source.cancel('Unmounted');
      console.log('Unmounted from page');
    };

  }, [tickets, lastChange]);
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

//The static method getInitialProps(), if present, gets called before 
// rendering, the results getting passed down to components as they render
// as props.

const getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
}

LandingPage.getInitialProps = getInitialProps;

export default LandingPage;
