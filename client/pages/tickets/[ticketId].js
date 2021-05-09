import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketInfo = ({ ticket, addFlash, currentUser }) => {
  const ticketId = ticket.id;
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId,
    },
    onSuccess: (order) => {
      console.log('order:', order);
      addFlash('New order created');
      Router.push(`/orders/${order.id}`);
    }
  });

  const onClick = () => {
    doRequest();
  };

  return (
    <div className="ticket-show">
      <h1>Ticket Details</h1>
      <ul>
        <li><label>Title</label>{ticket.title}</li>
        <li><label>Price</label>{ticket.price}</li>
      </ul>
      {currentUser && currentUser.id && ticket.status === 'available' &&
        <button className="btn btn-primary" onClick={onClick} >Buy Ticket</button>
      }
      {ticket.status !== 'available' &&
        <p>This ticket is no longer available for sale.</p>

      }
    </div>
  );
};

TicketInfo.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data, currentUser };
}
export default TicketInfo;