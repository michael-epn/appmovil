import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';

interface PokemonOption {
  name: string;
}

interface PokemonCombatProfile {
  id: number;
  name: string;
  sprites: { front_default: string | null };
  stats: { base_stat: number; stat: { name: string } }[];
}

@Component({
  selector: 'app-coliseo-biometrico',
  templateUrl: './coliseo-biometrico.page.html',
  styleUrls: ['./coliseo-biometrico.page.scss'],
})
export class ColiseoBiometricoPage implements OnInit {
  readonly combatStats = [
    { key: 'hp', label: 'Vitalidad' },
    { key: 'attack', label: 'Ataque' },
    { key: 'defense', label: 'Defensa' },
    { key: 'speed', label: 'Velocidad' },
  ];
  pokemonOptions: PokemonOption[] = [];
  firstName = '';
  secondName = '';
  firstPokemon: PokemonCombatProfile | null = null;
  secondPokemon: PokemonCombatProfile | null = null;
  loading = false;
  errorMessage = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.pokemonService.getPokemons(1302).subscribe({
      next: (response) => (this.pokemonOptions = response.results),
      error: (error: unknown) => {
        console.error('No se pudo cargar el repertorio del Coliseo:', error);
        this.errorMessage = 'No se pudo preparar el repertorio. Intenta nuevamente.';
      },
    });
  }

  compare(): void {
    if (!this.firstName || !this.secondName || this.firstName === this.secondName) return;

    this.loading = true;
    this.errorMessage = '';
    this.pokemonService.getPokemonComparison(this.firstName, this.secondName).subscribe({
      next: ({ first, second }) => {
        this.firstPokemon = first;
        this.secondPokemon = second;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('No se pudo realizar el combate estadístico:', error);
        this.errorMessage = 'No se pudo cargar la comparación. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  statValue(pokemon: PokemonCombatProfile | null, statName: string): number {
    return pokemon?.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0;
  }

  statProgress(pokemon: PokemonCombatProfile | null, statName: string): number {
    return Math.min(this.statValue(pokemon, statName) / 255, 1);
  }

  get firstTotal(): number {
    return this.combatStats.reduce((sum, stat) => sum + this.statValue(this.firstPokemon, stat.key), 0);
  }

  get secondTotal(): number {
    return this.combatStats.reduce((sum, stat) => sum + this.statValue(this.secondPokemon, stat.key), 0);
  }

  get winner(): string {
    if (!this.firstPokemon || !this.secondPokemon || this.firstTotal === this.secondTotal) return '';
    return this.firstTotal > this.secondTotal ? this.firstPokemon.name : this.secondPokemon.name;
  }
}
