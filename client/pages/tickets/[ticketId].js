import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const Ticket = ({ ticket }) => {

    const { doRequest, errors } = useRequest({
        method: 'post',
        url: '/api/orders',
        body: { ticketId: ticket.id },
        onSuccess: (order) => {
            Router.push('/orders/[orderId]', `/orders/${order.id}`);
        }
    });

    return <div>
        <h1>{ticket.title}</h1>
        <h4>Price: {ticket.price}$</h4>
        <button className="btn btn-primary" onClick={() => doRequest()}>
            Purchase
        </button>
    </div>
}

Ticket.getInitialProps = async (context, client) => {
    const { data } = await client.get(`/api/tickets/${context.query.ticketId}`);
    return { ticket: data };
}

export default Ticket;
