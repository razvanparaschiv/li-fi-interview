import { EventModel } from '../../model/event';
import { ParsedQs } from 'qs';
import { Event } from '../../model/event';

const fetchEvents = async (query: ParsedQs): Promise<Event> => {
  return EventModel.find(query).lean();
};

export default { fetchEvents };
