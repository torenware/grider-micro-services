import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

const LandingPage = (props) => {
  const [tickets, setTickets] = useState(props.tickets);

  const setTicketsSmart = newTickets => {
    const compObj = (obj1, obj2) => {
      if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
      }
      const obj1Set = new Set(Object.keys(obj1));
      const diff = [...Object.keys(obj2).filter(key => !obj1Set.has(key))]
      if (diff.length) {
        return false;
      }
      for (let key of obj1Set) {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
      return true;
    };
    const oldTickets = tickets;
    const nextTickets = [];
    const oldTktMap = oldTickets.reduce((map, tkt) => {
      map[tkt.id] = tkt;
      return map;
    }, {});
    const changed = {};
    for (tkt of newTickets) {
      const id = tkt.id;
      const oldTkt = oldTktMap.get(id);
      if (oldTkt) {
        delete oldTktMap[id];
        if (!compObj(oldTkt, tkt)) {
          changed.push(id);
          nextTickets.push(tkt);
        }
        else {
          nextTickets.push(oldTkt)
        }
      }
      else {
        nextTickets.push(tkt)
        changed.push(id);
      }
    }
    if (changed.length) {
      setTickets(nextTickets);
    }
  }

  // @see https://daviseford.com/blog/2019/07/11/react-hooks-check-if-mounted.html
  const componentIsMounted = useRef(true);
  useEffect(async () => {
    const source = axios.CancelToken.source();
    const client = axios.create({
      baseURL: '/',
      cancelToken: source.token,
    });
    const timer = setInterval(async () => {
      let fetched;
      try {
        fetched = await getInitialProps(null, client, props.currentUser);
      }
      catch (error) {
        if (Axios.isCancel(error)) {
        } else {
          throw error
        }
      }

      if (componentIsMounted.current) {
        setTickets([]);
        setTickets(fetched.tickets);
      }
    }, 20 * 1000);
    // remove timer on page teardown.
    return () => {
      componentIsMounted.current = false;
      source.cancel();
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
