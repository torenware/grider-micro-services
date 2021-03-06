import { useState, useEffect, useRef } from 'react';
import { mutate } from 'swr';
import StripeCheckout from 'react-stripe-checkout';
import axios from 'axios';
import useRequest from '../../hooks/use-request';
import enforceLogin from '../../utils/redirect-to-login';
import ErrorPage from '../404';

const PurchaseTicket = ({ order, currentUser }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [timerId, setTimerId] = useState(false);
  const mounted = useRef(true);
  const expired = useRef(false);
  const requestState = useRef(0);
  const cancelSource = axios.CancelToken.source();

  enforceLogin(currentUser);

  if (!order) {
    return <ErrorPage />;
  }

  const orderId = order.id;

  // Use useEffect to manage our time left string.
  useEffect(() => {
    mounted.current = true;
    const calcRemaining = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      if (mounted.current) {
        if (msLeft < 0) {
          clearInterval(timerId);
          setTimeRemaining(0);
          setTimerId(false);
          expired.current = true;
        }
        else {
          setTimeRemaining(Math.round(msLeft / 1000));
        }
      }
    };
    calcRemaining(); // start the clock!
    if (!expired.current) {
      const timer = setInterval(() => {
        try {
          calcRemaining();
        }
        catch (err) {
          console.log('threw in calcRemaining')
        }
      }, 1000);

      setTimerId(timer);
    }

    return () => {
      mounted.current = false;
      clearInterval(timerId);
      setTimerId(0);
      // Kill the request if it is progress.
      cancelSource.cancel();
      console.log('purchase page unmounted');
    };
  }, [setOrderCompleted, setTimeRemaining]);

  // If the sale succeeds, stop the timer and
  // and update the page.
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    cancelSource,
    body: {
      orderId,
      ticketId: order.ticket.id
      // must supply token at doRequest time.
    },
    onSuccess: (token) => {
      if (timerId) {
        clearInterval(timerId);
        setTimerId(false);
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
    requestState.current++;
    try {
      await doRequest({ token: token.id });
    }
    catch (err) {
      console.log('Threw in doRequest');
    }
    requestState.current++;
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
      <p>for "{order.ticket.title}" at ${order.ticket.price.toFixed(2)} USD.</p>
      <div>
        {fullContent()}
      </div>
    </div>

  );
}


PurchaseTicket.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;

  const { data: order } = await client.get(`/api/orders/${orderId}`);
  if (!order || !order.id) {
    throw new Error('Order not found');
  }
  return {
    order,
    currentUser,
  };
}

export default PurchaseTicket;