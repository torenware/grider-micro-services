import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TicketInfo = ({ ticket }) => {
  const router = useRouter();

  const purchaseUrl = `purchase/${ticket.id}`;
  console.log('ticket', ticket);
  return (
    <div className="ticket-show">
      <h1>Ticket Details</h1>
      <ul>
        <li><label>Title</label>{ticket.title}</li>
        <li><label>Price</label>{ticket.price}</li>
      </ul>
      <Link href={purchaseUrl}  ><a className="btn btn-primary">Buy Ticket</a></Link>

    </div>
  );
};

TicketInfo.getInitialProps = async (context, client, currentUser) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
}
export default TicketInfo;