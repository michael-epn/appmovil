import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { CharacterResponse } from '../models/rick-and-morty.model';

interface CacheEntry {
  expiresAt: number;
  response: CharacterResponse;
}

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://rickandmortyapi.com/api/character/';
  private readonly cachePrefix = 'rick-and-morty:characters:v1:';
  private readonly cacheDurationMs = 5 * 60 * 1000;

  getCharacters(page = 1, name?: string, forceRefresh = false): Observable<CharacterResponse> {
    let params = new HttpParams().set('page', page);
    if (name) {
      params = params.set('name', name);
    }
    const url = `${this.apiUrl}?${params.toString()}`;
    return this.getCachedResponse(url, forceRefresh, () =>
      this.http.get<CharacterResponse>(this.apiUrl, { params }),
    );
  }

  getCharactersByUrl(url: string, forceRefresh = false): Observable<CharacterResponse> {
    return this.getCachedResponse(url, forceRefresh, () =>
      this.http.get<CharacterResponse>(url),
    );
  }

  private getCachedResponse(
    url: string,
    forceRefresh: boolean,
    request: () => Observable<CharacterResponse>,
  ): Observable<CharacterResponse> {
    if (!forceRefresh) {
      const cachedResponse = this.readCache(url);
      if (cachedResponse) {
        return of(cachedResponse);
      }
    }

    return request().pipe(tap((response) => this.writeCache(url, response)));
  }

  private readCache(url: string): CharacterResponse | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const key = this.cachePrefix + url;
    try {
      const cachedValue = localStorage.getItem(key);
      if (!cachedValue) {
        return null;
      }

      const entry: unknown = JSON.parse(cachedValue);
      if (!this.isCacheEntry(entry) || entry.expiresAt <= Date.now()) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.response;
    } catch (error) {
      console.warn('Unable to read the character cache.', error);
      return null;
    }
  }

  private writeCache(url: string, response: CharacterResponse): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const entry: CacheEntry = {
        response,
        expiresAt: Date.now() + this.cacheDurationMs,
      };
      localStorage.setItem(this.cachePrefix + url, JSON.stringify(entry));
    } catch (error) {
      console.warn('Unable to save the character cache.', error);
    }
  }

  private isCacheEntry(value: unknown): value is CacheEntry {
    if (typeof value !== 'object' || value === null || !('expiresAt' in value) || !('response' in value)) {
      return false;
    }

    const { expiresAt, response } = value;
    return (
      typeof expiresAt === 'number' &&
      typeof response === 'object' &&
      response !== null &&
      'info' in response &&
      typeof response.info === 'object' &&
      response.info !== null &&
      'next' in response.info &&
      (typeof response.info.next === 'string' || response.info.next === null) &&
      'results' in response &&
      Array.isArray(response.results)
    );
  }
}
