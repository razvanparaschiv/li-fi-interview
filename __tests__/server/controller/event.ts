import { getFeesCollectedEvents } from '../../../src/server/controller/event';
import eventService from '../../../src/server/service/event';

import { Request, Response } from 'express';

jest.mock('../../../src/server/service/event', () => ({
  fetchEvents: jest.fn(),
}));

describe('getFeesCollectedEvents', () => {
  it('should fetch events and return them in response', async () => {
    const mockQuery = { key: 'value' };
    const mockEvents = [{ id: '1', name: 'Test Event' }];

    const req: Partial<Request> = {
      query: mockQuery,
    };

    const jsonFn = jest.fn();
    const res: Partial<Response> = {
      json: jsonFn,
    };

    (eventService.fetchEvents as jest.Mock).mockResolvedValue(mockEvents);

    await getFeesCollectedEvents(req as Request, res as Response);

    expect(eventService.fetchEvents).toHaveBeenCalledWith(mockQuery);
    expect(jsonFn).toHaveBeenCalledWith(mockEvents);
  });
});
