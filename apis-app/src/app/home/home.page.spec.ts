import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { InfiniteScrollCustomEvent, RefresherCustomEvent } from '@ionic/angular';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('rick-and-morty:characters:v1:')) {
        localStorage.removeItem(key);
      }
    }

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 350));
    httpTestingController
      .expectOne('https://rickandmortyapi.com/api/character/?page=1')
      .flush({
        info: {
          count: 2,
          pages: 2,
          next: 'https://rickandmortyapi.com/api/character/?page=2',
          prev: null,
        },
        results: [
          {
            id: 1,
            name: 'Rick Sanchez',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: 'Earth', url: '' },
            location: { name: 'Earth', url: '' },
            image: '',
            episode: [],
            url: '',
            created: '',
          },
        ],
      });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('refreshes from the network and completes the refresher', () => {
    let completed = false;
    const target = document.createElement('ion-refresher') as HTMLIonRefresherElement;
    target.complete = async () => {
      completed = true;
    };
    const event = new CustomEvent('ionRefresh');
    Object.defineProperty(event, 'target', { value: target });

    component.refreshCharacters(event as RefresherCustomEvent);

    httpTestingController
      .expectOne('https://rickandmortyapi.com/api/character/?page=1')
      .flush({
        info: { count: 1, pages: 1, next: null, prev: null },
        results: [],
      });

    expect(completed).toBe(true);
    expect(component.characters()).toEqual([]);
    expect(component.nextUrl()).toBeNull();
  });

  it('keeps the existing list and pagination when refresh fails', () => {
    let completed = false;
    const target = document.createElement('ion-refresher') as HTMLIonRefresherElement;
    target.complete = async () => {
      completed = true;
    };
    const event = new CustomEvent('ionRefresh');
    Object.defineProperty(event, 'target', { value: target });
    const existingCharacters = component.characters();

    component.refreshCharacters(event as RefresherCustomEvent);

    httpTestingController
      .expectOne('https://rickandmortyapi.com/api/character/?page=1')
      .flush(
        { error: 'Service unavailable' },
        { status: 500, statusText: 'Internal Server Error' },
      );

    expect(component.characters()).toEqual(existingCharacters);
    expect(component.nextUrl()).toBe('https://rickandmortyapi.com/api/character/?page=2');
    expect(component.loadMoreError()).toContain('No se pudo actualizar');
    expect(completed).toBe(true);
  });

  it('resets the list and reports a 404 when a search has no matches', async () => {
    component.onSearchChange(new CustomEvent('ionInput', { detail: { value: 'no-match' } }));
    expect(component.characters()).toEqual([]);
    expect(component.nextUrl()).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 350));
    httpTestingController
      .expectOne('https://rickandmortyapi.com/api/character/?page=1&name=no-match')
      .flush(
        { error: 'There is nothing here' },
        { status: 404, statusText: 'Not Found' },
      );

    expect(component.error()).toBe('No se encontraron personajes con ese nombre.');
    expect(component.loading()).toBe(false);
  });

  it('loads the next URL, deduplicates results and disables infinite scroll at the end', () => {
    let completed = false;
    const target = document.createElement('ion-infinite-scroll') as HTMLIonInfiniteScrollElement;
    target.disabled = false;
    target.complete = async () => {
      completed = true;
    };
    const event = new CustomEvent('ionInfinite');
    Object.defineProperty(event, 'target', { value: target });

    component.loadNextPage(event as InfiniteScrollCustomEvent);

    httpTestingController
      .expectOne('https://rickandmortyapi.com/api/character/?page=2')
      .flush({
        info: { count: 2, pages: 2, next: null, prev: 'https://rickandmortyapi.com/api/character/?page=1' },
        results: [
          {
            id: 1,
            name: 'Rick Sanchez',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: 'Earth', url: '' },
            location: { name: 'Earth', url: '' },
            image: '',
            episode: [],
            url: '',
            created: '',
          },
          {
            id: 2,
            name: 'Morty Smith',
            status: 'Alive',
            species: 'Human',
            type: '',
            gender: 'Male',
            origin: { name: 'Earth', url: '' },
            location: { name: 'Earth', url: '' },
            image: '',
            episode: [],
            url: '',
            created: '',
          },
        ],
      });

    expect(component.characters().map((character) => character.id)).toEqual([1, 2]);
    expect(target.disabled).toBe(true);
    expect(completed).toBe(true);
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
