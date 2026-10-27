import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { InfiniteScrollCustomEvent } from '@ionic/angular';
import type { RefresherCustomEvent } from '@ionic/angular';
import { catchError, debounce, finalize, map, of, Subject, switchMap, timer } from 'rxjs';

import { Character } from '../models/rick-and-morty.model';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
  ],
})
export class HomePage implements OnInit {
  private readonly characterService = inject(CharacterService);
  private readonly destroyRef = inject(DestroyRef);

  readonly characters = signal<Character[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly loadMoreError = signal<string | null>(null);
  readonly nextUrl = signal<string | null>(null);
  readonly searchTerm = signal('');
  private readonly searchRequests = new Subject<{
    query: string;
    generation: number;
    forceRefresh?: boolean;
    refresher?: RefresherCustomEvent;
  }>();
  private generation = 0;
  private loadingNextGeneration: number | null = null;
  private refreshPreviousNextUrl: string | null = null;

  ngOnInit(): void {
    this.searchRequests
      .pipe(
        debounce(({ forceRefresh }) => (forceRefresh ? of(0) : timer(300))),
        switchMap(({ query, generation, forceRefresh, refresher }) =>
          this.characterService.getCharacters(1, query, forceRefresh).pipe(
            map((response) => ({ response, generation, error: null, refresher })),
            catchError((error: HttpErrorResponse) =>
              of({ response: null, generation, error, refresher }),
            ),
            finalize(() => refresher?.target.complete()),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ response, generation, error, refresher }) => {
        if (generation !== this.generation) {
          return;
        }

        if (response) {
          this.characters.set(response.results);
          this.nextUrl.set(response.info.next);
          this.loadMoreError.set(null);
          this.refreshPreviousNextUrl = null;
        } else {
          const message =
            error?.status === 404
              ? 'No se encontraron personajes con ese nombre.'
              : 'No se pudieron cargar los personajes. Inténtalo de nuevo.';
          if (refresher && this.characters().length > 0) {
            this.nextUrl.set(this.refreshPreviousNextUrl);
            this.loadMoreError.set(`No se pudo actualizar: ${message}`);
          } else {
            this.characters.set([]);
            this.nextUrl.set(null);
            this.error.set(message);
          }
          this.refreshPreviousNextUrl = null;
        }

        this.loading.set(false);
      });

    this.requestCharacters(this.searchTerm());
  }

  loadCharacters(): void {
    this.loading.set(true);
    this.requestCharacters(this.searchTerm());
  }

  refreshCharacters(event: RefresherCustomEvent): void {
    this.error.set(null);
    this.loadMoreError.set(null);
    this.loading.set(this.characters().length === 0);
    this.requestCharacters(this.searchTerm(), true, event);
  }

  onSearchChange(event: CustomEvent<{ value?: string | null }>): void {
    const query = event.detail.value?.trim() ?? '';
    this.searchTerm.set(query);
    this.characters.set([]);
    this.nextUrl.set(null);
    this.error.set(null);
    this.loadMoreError.set(null);
    this.loading.set(true);
    this.requestCharacters(query);
  }

  private requestCharacters(
    query: string,
    forceRefresh = false,
    refresher?: RefresherCustomEvent,
  ): void {
    this.generation++;
    this.loadingNextGeneration = null;
    this.refreshPreviousNextUrl = forceRefresh
      ? (this.nextUrl() ?? this.refreshPreviousNextUrl)
      : null;
    this.nextUrl.set(null);
    this.error.set(null);
    this.searchRequests.next({ query, generation: this.generation, forceRefresh, refresher });
  }

  loadNextPage(event: InfiniteScrollCustomEvent): void {
    const url = this.nextUrl();
    const generation = this.generation;
    if (!url || this.loadingNextGeneration === generation) {
      if (!url) {
        event.target.disabled = true;
      }
      event.target.complete();
      return;
    }

    this.loadingNextGeneration = generation;
    this.loadMoreError.set(null);
    this.characterService
      .getCharactersByUrl(url)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.loadingNextGeneration === generation) {
            this.loadingNextGeneration = null;
          }
          event.target.complete();
        }),
      )
      .subscribe({
        next: (response) => {
          if (generation !== this.generation) {
            return;
          }

          const knownIds = new Set(this.characters().map((character) => character.id));
          this.characters.update((characters) => [
            ...characters,
            ...response.results.filter((character) => {
              if (knownIds.has(character.id)) {
                return false;
              }
              knownIds.add(character.id);
              return true;
            }),
          ]);
          this.nextUrl.set(response.info.next);
          if (response.info.next === null) {
            event.target.disabled = true;
          }
        },
        error: () => {
          if (generation === this.generation) {
            this.loadMoreError.set(
              'No se pudieron cargar más personajes. Desplázate para volver a intentar.',
            );
          }
        },
      });
  }
}
