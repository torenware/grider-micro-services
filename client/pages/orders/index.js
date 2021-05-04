// List the orders of the currently logged in person.
import enforceLogin from '../../utils/redirect-to-login';


const UserOrders = ({ currentUser, orders }) => {

  enforceLogin(currentUser);

  const renderOrder = order => {
    return (
      <div className="row" key={order.id}>
        <div className="col-sm title">
          {order.ticket.title}
        </div>
        <div className="col-sm">
          {order.ticket.price}
        </div>
        <div className="col-sm">
          {order.status}
        </div>
      </div>
    );
  }

  const orderHeaders = (
    <div className="row font-weight-bold" >
      <div className="col-sm title">
        Event Title
        </div>
      <div className="col-sm">
        At Price
        </div>
      <div className="col-sm">
        Order Status
        </div>
    </div>
  );

  const renderOrders = orders.map(order => {
    return renderOrder(order);
  });

  return (
    <div>
      <h1>Your Orders</h1>

      {orders.length ?

        (<div className="container order-list">
          {orderHeaders}
          {renderOrders}
        </div>) :

        (<div>
          You do not yet have any orders.
        </div>)
      }
    </div>

  );

};

UserOrders.getInitialProps = async (context, client, currentUser) => {
  if (!currentUser) {
    return {
      orders: [],
      currentUser: null
    }
  }
  const { data: orders } = await client.get(`/api/orders`);
  return {
    orders,
    currentUser
  };
}

export default UserOrders;