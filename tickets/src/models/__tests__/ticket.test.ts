import { Ticket } from "../ticket";

it('implements Optimistic Concurency Control', async (done) => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '1234543212344321234'
    });

    await ticket.save();

    const ticketV1 = await Ticket.findOne({ title: 'concert' });
    const ticketV2 = await Ticket.findOne({ title: 'concert' });

    ticketV1!.set({ price: 10 });
    ticketV1!.set({ price: 5 });

    await ticketV1!.save();
    try {
        await ticketV2!.save()
    } catch (e) {
        return done();
    };

    throw new Error('Should not reach here');
});

it('increments the version of the document', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: '1234543212344321234'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);

    await ticket.save();
    expect(ticket.version).toEqual(3);
});