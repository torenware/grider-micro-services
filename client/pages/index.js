import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
  const rows = tickets.map(ticket => {
    const detailUri = `/tickets/${ticket.id}`;
    const link = (<Link href={detailUri}><a>{ticket.title}</a></Link>);
    return (
      <div className='row' key={ticket.id}>
        <div className="col-sm"><label>Title:</label>{link}</div>
        <div className="col-sm"><label>Price:</label>{ticket.price}</div>
        <div className="col-sm"><label>Available?:</label>{ticket.status}</div>
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
LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
}

export default LandingPage;
