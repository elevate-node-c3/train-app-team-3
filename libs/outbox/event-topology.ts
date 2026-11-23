export const EVENTS_EXCHANGE = 'app.events';


export const EVENT_QUEUES: { queue: string; routingKeys: string[] }[] = [
  { queue: 'inventory.trip-events', routingKeys: ['trip-published', 'trip-withdrawn'] },
  { queue: 'catalog.timetable-published', routingKeys: ['timetable-published'] },
];