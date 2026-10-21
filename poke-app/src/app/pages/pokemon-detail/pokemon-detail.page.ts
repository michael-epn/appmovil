import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PokemonService } from 'src/app/services/pokemon.service';

interface PokemonOption {
  name: string;
}

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
})
export class PokemonDetailPage implements OnInit {
  pokemon: any = null;
  comparisonPokemon: any = null;
  pokemonOptions: PokemonOption[] = [];
  galleryImages: string[] = [];
  animatedImageUrl = '';
  loading = true;
  errorMessage = '';
  comparisonError = '';

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargarDetalle(id);
      } else {
        this.errorMessage = 'No se especificó un Pokémon.';
        this.loading = false;
      }
    });
    this.cargarOpcionesComparacion();
  }

  cargarDetalle(id: string) {
    this.loading = true;
    this.errorMessage = '';
    this.pokemonService.getPokemonDetails(id).subscribe({
      next: (data) => {
        this.pokemon = data;
        this.galleryImages = this.obtenerImagenes(data.sprites, data.id);
        this.animatedImageUrl =
          data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default ||
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar detalle:', err);
        this.errorMessage = 'No se pudo cargar el Pokémon. Intenta nuevamente.';
        this.loading = false;
      },
    });
  }

  cargarOpcionesComparacion() {
    this.pokemonService.getPokemons(30).subscribe({
      next: (response) => {
        this.pokemonOptions = response.results;
      },
      error: (err) => {
        console.error('Error al cargar opciones de comparación:', err);
        this.comparisonError = 'No se pudieron cargar los Pokémon para comparar.';
      },
    });
  }

  compararCon(name: string) {
    this.comparisonPokemon = null;
    this.comparisonError = '';
    if (!name) {
      return;
    }

    this.pokemonService.getPokemonDetails(name).subscribe({
      next: (data) => {
        this.comparisonPokemon = data;
      },
      error: (err) => {
        console.error('Error al cargar el Pokémon para comparar:', err);
        this.comparisonError = 'No se pudo cargar el Pokémon seleccionado.';
      },
    });
  }

  private obtenerImagenes(sprites: unknown, pokemonId: number): string[] {
    const spriteData = sprites as any;
    const principales = [
      spriteData?.front_default,
      spriteData?.back_default,
      spriteData?.front_shiny,
      spriteData?.back_shiny,
      spriteData?.other?.['official-artwork']?.front_default,
      spriteData?.other?.home?.front_default,
      spriteData?.other?.dream_world?.front_default,
    ];
    const urls = [...principales, ...this.recogerUrls(sprites)];
    const imagenes = [...new Set(urls.filter((url): url is string => typeof url === 'string' && url.length > 0))];

    if (imagenes.length < 5) {
      const spritesUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
      const complementarias = [
        `${spritesUrl}/${pokemonId}.png`,
        `${spritesUrl}/back/${pokemonId}.png`,
        `${spritesUrl}/shiny/${pokemonId}.png`,
        `${spritesUrl}/back/shiny/${pokemonId}.png`,
        `${spritesUrl}/other/official-artwork/${pokemonId}.png`,
      ];
      imagenes.push(...complementarias.filter((url) => !imagenes.includes(url)));
    }

    return imagenes.slice(0, 12);
  }

  private recogerUrls(value: unknown): string[] {
    if (typeof value === 'string') {
      return value.startsWith('http') ? [value] : [];
    }
    if (Array.isArray(value)) {
      return value.reduce<string[]>(
        (urls, entry: unknown) => urls.concat(this.recogerUrls(entry)),
        []
      );
    }
    if (value && typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).reduce<string[]>(
        (urls, entry) => urls.concat(this.recogerUrls(entry)),
        []
      );
    }
    return [];
  }
}
