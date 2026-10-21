import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonService } from 'src/app/services/pokemon.service';


@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.page.html',
  styleUrls: ['./pokemon-list.page.scss'],
})
export class PokemonListPage implements OnInit {
  pokemons: any[] = [];
  pokemonsFiltrados: any[] = [];
  loading = false;

  constructor(private pokemonService: PokemonService, private router: Router) {}

  ngOnInit() {
    this.fetchPokemons();
    
  }

  fetchPokemons() {
    this.loading = true;
    this.pokemonService.getPokemons(10).subscribe({
      next: (response) => {
        this.pokemons = response.results;
        this.pokemonsFiltrados = response.results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Pokémon:', error);
        this.loading = false;
      },
    });
  }

  searchTerm: string = '';
  filtrar() {
    const query = this.searchTerm.toLowerCase().trim();
    this.pokemonsFiltrados = query
      ? this.pokemons.filter(p => p.name.toLowerCase().includes(query))
      : [...this.pokemons];
  }
  verDetalle(name: string) {
    this.router.navigate(['/pokemon-detail', name]);
  }
}