import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class AuditoriaSubscriber implements EntitySubscriberInterface {}
