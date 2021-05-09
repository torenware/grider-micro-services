import { useState, useEffect } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import enforceLogin from '../../utils/redirect-to-login';

const PurchaseTicket = ({ order, currentUser }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [timerId, setTimerId] = useState(false);

  enforceLogin(currentUser);

  const orderId = order.id;

  // Use useEffect to manage our time left string.
  useEffect(() => {
    const calcRemaining = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      if (msLeft < 0) {
        setTimeRemaining(0);
        setTimerId(false);
      }
      else {
        setTimeRemaining(Math.round(msLeft / 1000));
      }
    };
    calcRemaining(); // start the clock!
    const timer = setInterval(() => {
      calcRemaining();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  console.log(typeof stopTimer);

  // If the sale succeeds, stop the timer and
  // and update the page.
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId,
      ticketId: order.ticket.id
      // must supply token at doRequest time.
    },
    onSuccess: (token) => {
      if (timerId) {
        clearInterval(timerId);
      }
      setOrderCompleted(true);
    }
  });

  const displayBeforeCompletion = () => {
    if (timeRemaining) {
      return notExpiredContent();
    }
    return (
      <div>
        <span>This order has expired!</span>
      </div>
    );
  };

  const processStripeToken = async (token) => {
    // We only need the id, so call as follows.
    await doRequest({ token: token.id });
  };



  const notExpiredContent = () => {
    return (
      <div>
        <p>
          <span>You have {timeRemaining} seconds left to purchase this order.</span>
        </p>
        <StripeCheckout
          token={processStripeToken}
          name={`Ticket: ${order.ticket.title}`}
          description="This is not a real service, so best not to use a real CC!!"
          stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
          amount={order.ticket.price * 100}
          email={currentUser.email}
        >
          <button className='btn btn-primary'>
            Pay For Order
          </button>
        </StripeCheckout>
      </div>
    );
  };

  const fullContent = () => {
    if (orderCompleted) {
      return (
        <p>Your order is completed</p>
      );
    }
    return displayBeforeCompletion();
  }


  return (
    <div>
      <h1>Complete Your Purchase</h1>
      <p>for "{order.ticket.title}" at {order.ticket.price} USD.</p>
      <div>
        {fullContent()}
      </div>
    </div>

  );
}

PurchaseTicket.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data: order } = await client.get(`/api/orders/${orderId}`);
  return {
    order,
    currentUser,
  };
}

export default PurchaseTicket;