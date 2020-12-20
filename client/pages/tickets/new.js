import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');


    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title,
            price
        },
        onSuccess: () => {
            Router.push('/')
        }
    });

    const onSubmit = (e) => {
        e.preventDefault();
        doRequest();
    }

    const handlePriceBlur = (event) => {
        const value = parseFloat(event.target.value);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    }

    return <div>
        <h1>Create a ticket</h1>
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input
                    value={title}
                    className="form-control"
                    onChange={e => setTitle(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input
                    onBlur={handlePriceBlur}
                    value={price}
                    className="form-control"
                    onChange={e => setPrice(e.target.value)}
                />
            </div>
            {errors}
            <button className="btn btn-primary">Submit</button>
        </form>
    </div>
}

export default NewTicket