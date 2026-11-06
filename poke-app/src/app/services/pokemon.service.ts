import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap } from 'rxjs';

export interface NamedResource {
  name: string;
  url: string;
}

export interface TypeEffectiveness {
  double: NamedResource[];
  half: NamedResource[];
  none: NamedResource[];
}

export interface EvolutionNode {
  name: string;
  speciesId: number;
  imageUrl: string;
  requirement: string;
  evolvesTo: EvolutionNode[];
}

interface PokemonTypeData {
  name: string;
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
}

interface EvolutionDetail {
  min_level?: number | null;
  item?: NamedResource | null;
  held_item?: NamedResource | null;
  min_happiness?: number | null;
  time_of_day?: string;
  trigger?: NamedResource;
}

interface EvolutionLink {
  species: NamedResource;
  evolves_to: EvolutionLink[];
  evolution_details: EvolutionDetail[];
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemons(limit: number = 5, offset: number = 0): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon?limit=${limit}&offset=${offset}`);
  }

  getPokemonDetails(nameOrId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pokemon/${nameOrId}`);
  }

  getPokemonComparison(first: string, second: string): Observable<{ first: any; second: any }> {
    return forkJoin({
      first: this.getPokemonDetails(first),
      second: this.getPokemonDetails(second),
    });
  }

  getPokemonTypes(limit = 30): Observable<{ results: NamedResource[] }> {
    return this.http.get<{ results: NamedResource[] }>(`${this.apiUrl}/type?limit=${limit}`);
  }

  getTypeDetails(nameOrId: string): Observable<PokemonTypeData> {
    return this.http.get<PokemonTypeData>(`${this.apiUrl}/type/${nameOrId}`);
  }

  getTypeEffectiveness(nameOrId: string): Observable<TypeEffectiveness> {
    return this.getTypeDetails(nameOrId).pipe(
      map(({ damage_relations }) => ({
        double: damage_relations.double_damage_from,
        half: damage_relations.half_damage_from,
        none: damage_relations.no_damage_from,
      }))
    );
  }

  getPokemonEffectiveness(nameOrId: string): Observable<TypeEffectiveness> {
    return this.getPokemonDetails(nameOrId).pipe(
      switchMap((pokemon) => {
        const defendingTypeRequests: Observable<PokemonTypeData>[] = pokemon.types.map(
          (entry: { type: NamedResource }) => this.getTypeDetails(entry.type.name)
        );
        return forkJoin({
          defendingTypes: forkJoin(defendingTypeRequests),
          attackTypes: this.getPokemonTypes(),
        }).pipe(
          map(({ defendingTypes, attackTypes }) => {
            const result: TypeEffectiveness = { double: [], half: [], none: [] };
            attackTypes.results.forEach((attackType) => {
              const multiplier = defendingTypes.reduce<number>((total, defendingType) => {
                const relations = defendingType.damage_relations;
                if (
                  relations.no_damage_from.some(
                    (type: NamedResource) => type.name === attackType.name
                  )
                ) {
                  return 0;
                }
                if (
                  relations.double_damage_from.some(
                    (type: NamedResource) => type.name === attackType.name
                  )
                ) {
                  return total * 2;
                }
                if (
                  relations.half_damage_from.some(
                    (type: NamedResource) => type.name === attackType.name
                  )
                ) {
                  return total * 0.5;
                }
                return total;
              }, 1);

              if (multiplier === 0) {
                result.none.push(attackType);
              } else if (multiplier > 1) {
                result.double.push(attackType);
              } else if (multiplier < 1) {
                result.half.push(attackType);
              }
            });
            return result;
          })
        );
      })
    );
  }

  getEvolutionLine(nameOrId: string): Observable<EvolutionNode> {
    return this.http.get<any>(`${this.apiUrl}/pokemon-species/${nameOrId}`).pipe(
      switchMap((species) =>
        this.http.get<{ chain: EvolutionLink }>(species.evolution_chain.url)
      ),
      map(({ chain }) => this.toEvolutionNode(chain, 'Fase inicial'))
    );
  }

  private toEvolutionNode(link: EvolutionLink, requirement: string): EvolutionNode {
    const speciesId = Number(link.species.url.match(/\/(\d+)\/?$/)?.[1] ?? 0);
    return {
      name: link.species.name,
      speciesId,
      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      requirement,
      evolvesTo: link.evolves_to.map((child) =>
        this.toEvolutionNode(child, this.describeEvolution(child.evolution_details))
      ),
    };
  }

  private describeEvolution(details: EvolutionDetail[]): string {
    const requirements: string[] = [];
    details.forEach((detail) => {
      if (detail.min_level) requirements.push(`Nivel ${detail.min_level}`);
      if (detail.item) requirements.push(`Usar ${detail.item.name.replace(/-/g, ' ')}`);
      if (detail.held_item) requirements.push(`Llevar ${detail.held_item.name.replace(/-/g, ' ')}`);
      if (detail.min_happiness) requirements.push(`Amistad ${detail.min_happiness}+`);
      if (detail.time_of_day) requirements.push(`Durante ${detail.time_of_day}`);
      if (detail.trigger?.name === 'trade') requirements.push('Intercambio');
    });
    return requirements.length ? requirements.join(' · ') : 'Condición especial';
  }
}
