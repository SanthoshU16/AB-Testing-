import { Pipe, PipeTransform } from '@angular/core';
import { TrackingEvent } from '../../models/tracking-event.model';

@Pipe({ name: 'credCount', standalone: true })
export class CredCountPipe implements PipeTransform {
  transform(events: TrackingEvent[]): number {
    return events.filter(e => e.eventType === 'credential_attempt').length;
  }
}
