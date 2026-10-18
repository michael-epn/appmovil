import { Injectable, signal } from '@angular/core';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class TrackingSessionService {
  readonly currentLocation = signal<Coordinates | null>(null);
  readonly origin = signal<Coordinates | null>(null);
  readonly destination = signal<Coordinates | null>(null);
  readonly waypoints = signal<Coordinates[]>([]);
  readonly isTracking = signal(false);

  updateCurrentLocation(location: Coordinates): void {
    this.currentLocation.set(location);
    if (this.isTracking()) {
      this.waypoints.update(points => [...points, location]);
    }
  }

  start(location: Coordinates): void {
    this.origin.set(location);
    this.destination.set(null);
    this.waypoints.set([]);
    this.currentLocation.set(location);
    this.isTracking.set(true);
  }

  stop(location: Coordinates): void {
    this.currentLocation.set(location);
    this.destination.set(location);
    this.isTracking.set(false);
  }
}
