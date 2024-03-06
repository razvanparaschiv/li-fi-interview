import eventService from '../../../src/server/service/event';

jest.mock('../../../src/model/event', () => {
  const mockFind = jest.fn().mockReturnThis();
  const mockLean = jest
    .fn()
    .mockResolvedValue([{ id: '1', name: 'Test Event' }]);

  return {
    EventModel: {
      find: mockFind,
      lean: mockLean,
    },
  };
});

describe('fetchEvents', () => {
  it('fetches events successfully', async () => {
    const query = { name: 'Test Event' };

    const events = await eventService.fetchEvents(query);

    expect(events).toEqual([{ id: '1', name: 'Test Event' }]);
  });
});
