import { Request, Response } from 'express';
import eventService from '../service/event';
import { Event } from '../../model/event';

export const getFeesCollectedEvents = async (
  req: Request,
  res: Response,
): Promise<Response<Event>> => {
  const query = req.query;

  const result = await eventService.fetchEvents(query);

  return res.json(result);
};
