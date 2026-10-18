import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tab1Page } from './tab1.page';
import { TrackingSessionService } from '../services/tracking-session';

describe('Tab1Page', () => {
  let fixture: ComponentFixture<Tab1Page>;
  let component: Tab1Page;
  let session: TrackingSessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tab1Page]
    }).compileComponents();

    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
    session = TestBed.inject(TrackingSessionService);
    fixture.detectChanges();
  });

  it('builds Google Maps links from the tracked route and current location', () => {
    session.start({ latitude: 10, longitude: 20 });
    session.updateCurrentLocation({ latitude: 11, longitude: 21 });
    session.stop({ latitude: 12, longitude: 22 });

    const routeUrl = new URL(component.routeUrl()!);
    expect(routeUrl.origin).toBe('https://www.google.com');
    expect(routeUrl.pathname).toBe('/maps/dir/');
    expect(routeUrl.searchParams.get('api')).toBe('1');
    expect(routeUrl.searchParams.get('origin')).toBe('10,20');
    expect(routeUrl.searchParams.get('destination')).toBe('12,22');
    expect(routeUrl.searchParams.get('waypoints')).toBe('11,21');

    const currentLocationUrl = new URL(component.currentLocationUrl()!);
    expect(currentLocationUrl.pathname).toBe('/maps/search/');
    expect(currentLocationUrl.searchParams.get('query')).toBe('12,22');
  });

  it('does not expose a route link before a tracking session is completed', () => {
    expect(component.routeUrl()).toBeNull();
  });
});
