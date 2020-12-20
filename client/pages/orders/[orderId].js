import { useState, useEffect } from 'react';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';


const getSecLeft = (time) => {
    return Math.round((new Date(time).getTime() - new Date().getTime()) / 1000)
}

const Order = ({ order, currentUser }) => {
    const [expires, setExpires] = useState(getSecLeft(order.expiresAt));

    const { doRequest, errors } = useRequest({
        method: 'post',
        url: '/api/payments',
        body: {
            orderId: order.id
        },
        onSuccess: () => {
            Router.push('/orders');
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setExpires(getSecLeft(order.expiresAt));
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    const handlePurchase = (data) => {
        doRequest({ token: data.id });
    };

    return <div>
        <h1>Order</h1>
        <h3>
            {expires > 0 ? `Expires in: ${expires} seconds` : 'Order Expired'}
        </h3>
        {errors}
        <StripeCheckout
            token={handlePurchase}
            stripeKey="pk_test_kgrMmzAPZsVihs5keM9YsSw400b2n9KAvc"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
    </div>
};

Order.getInitialProps = async (context, client) => {
    const { data } = await client.get(`/api/orders/${context.query.orderId}`);
    return { order: data };
}

export default Order;