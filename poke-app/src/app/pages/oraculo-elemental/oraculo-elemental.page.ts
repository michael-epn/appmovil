import { Component, OnInit } from '@angular/core';
import { NamedResource, PokemonService, TypeEffectiveness } from '../../services/pokemon.service';

interface PokemonOption {
  name: string;
}

@Component({
  selector: 'app-oraculo-elemental',
  templateUrl: './oraculo-elemental.page.html',
  styleUrls: ['./oraculo-elemental.page.scss'],
})
export class OraculoElementalPage implements OnInit {
  readonly groups = [
    { key: 'double', label: 'Daño x2', multiplier: 'x2', color: 'danger' },
    { key: 'half', label: 'Daño x0.5', multiplier: 'x0.5', color: 'success' },
    { key: 'none', label: 'Daño x0', multiplier: 'x0', color: 'medium' },
  ] as const;
  mode: 'type' | 'pokemon' = 'type';
  typeOptions: NamedResource[] = [];
  pokemonOptions: PokemonOption[] = [];
  selectedType = '';
  selectedPokemon = '';
  effectiveness: TypeEffectiveness | null = null;
  loading = false;
  errorMessage = '';
  analyzedName = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemonService.getPokemonTypes().subscribe({
      next: (response) => {
        this.typeOptions = response.results.filter(
          (type) => type.name !== 'unknown' && type.name !== 'shadow'
        );
      },
      error: (error: unknown) => {
        console.error('No se pudieron cargar los tipos elementales:', error);
        this.errorMessage = 'No se pudo cargar el catálogo de tipos.';
      },
    });
    this.pokemonService.getPokemons(1302).subscribe({
      next: (response) => (this.pokemonOptions = response.results),
      error: (error: unknown) => {
        console.error('No se pudo cargar el catálogo de especímenes:', error);
        this.errorMessage = 'No se pudo cargar el catálogo de Pokémon.';
      },
    });
  }

  analyzeSelection(): void {
    const selection = this.mode === 'type' ? this.selectedType : this.selectedPokemon;
    if (!selection) {
      this.effectiveness = null;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.analyzedName = selection;
    const request =
      this.mode === 'type'
        ? this.pokemonService.getTypeEffectiveness(selection)
        : this.pokemonService.getPokemonEffectiveness(selection);

    request.subscribe({
      next: (effectiveness) => {
        this.effectiveness = effectiveness;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('No se pudo analizar la afinidad elemental:', error);
        this.errorMessage = 'No se pudo completar el análisis. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  resourcesFor(key: 'double' | 'half' | 'none'): NamedResource[] {
    return this.effectiveness?.[key] ?? [];
  }
}
