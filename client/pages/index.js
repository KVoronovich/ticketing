import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {

    const ticketList = tickets.map(ticket => <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
            <Link href="/tickets/[ticketId" as={`/tickets/${ticket.id}`}>
                <a>View</a>
            </Link>
        </td>
    </tr>);

    return (
        <div>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                       <td>Title</td>
                       <td>Price</td>
                       <td>Link</td>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
};

LandingPage.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
}

export default LandingPage;
