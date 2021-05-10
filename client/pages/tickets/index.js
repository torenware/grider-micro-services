// List the orders of the currently logged in person.
import enforceLogin from '../../utils/redirect-to-login';


const UserTickets = ({ currentUser, tickets }) => {

  enforceLogin(currentUser);

  const renderTicket = ticket => {
    return (
      <div className="row" key={ticket.id}>
        <div className="col-sm title">
          {ticket.title}
        </div>
        <div className="col-sm">
          ${ticket.price.toFixed(2)}
        </div>
        <div className="col-sm">
          {ticket.status}
        </div>
      </div>
    );
  }

  const ticketHeaders = (
    <div className="row font-weight-bold" >
      <div className="col-sm title">
        Event Title
        </div>
      <div className="col-sm">
        At Price
        </div>
      <div className="col-sm">
        Status
        </div>
    </div>
  );

  const renderTickets = tickets.map(ticket => {
    return renderTicket(ticket);
  });

  return (
    <div>
      <h1>Your Tickets</h1>
      <h4>For User {currentUser.email}</h4>

      {tickets.length ?

        (<div className="container ticket-list">
          {ticketHeaders}
          {renderTickets}
        </div>) :

        (<div>
          You have not sold any tickets.
        </div>)
      }
    </div>

  );

};

UserTickets.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) {
    return {
      tickets: [],
      currentUser: null
    }
  }
  const { data: tickets } = await client.get(`/api/tickets/selling`);
  return {
    tickets,
    currentUser
  };
}

export default UserTickets;