import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvolutionNode, PokemonService } from '../../services/pokemon.service';

interface PokemonOption {
  name: string;
}

@Component({
  selector: 'app-laboratorio-genetico',
  templateUrl: './laboratorio-genetico.page.html',
  styleUrls: ['./laboratorio-genetico.page.scss'],
})
export class LaboratorioGeneticoPage implements OnInit {
  pokemonOptions: PokemonOption[] = [];
  selectedPokemon = '';
  evolutionLine: EvolutionNode | null = null;
  loading = false;
  errorMessage = '';

  constructor(private pokemonService: PokemonService, private router: Router) {}

  ngOnInit(): void {
    this.pokemonService.getPokemons(1302).subscribe({
      next: (response) => (this.pokemonOptions = response.results),
      error: (error: unknown) => {
        console.error('No se pudo cargar el catálogo del laboratorio:', error);
        this.errorMessage = 'No se pudo cargar el catálogo de especímenes.';
      },
    });
  }

  analyzeLine(): void {
    if (!this.selectedPokemon) {
      this.evolutionLine = null;
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.pokemonService.getEvolutionLine(this.selectedPokemon).subscribe({
      next: (line) => {
        this.evolutionLine = line;
        this.loading = false;
      },
      error: (error: unknown) => {
        console.error('No se pudo reconstruir la línea evolutiva:', error);
        this.errorMessage = 'No se pudo reconstruir esta línea evolutiva.';
        this.loading = false;
      },
    });
  }

  openPokemon(name: string): void {
    void this.router.navigate(['/pokemon-detail', name]);
  }
}
