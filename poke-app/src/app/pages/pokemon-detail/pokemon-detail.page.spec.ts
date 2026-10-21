import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';
import { PokemonDetailPage } from './pokemon-detail.page';

describe('PokemonDetailPage', () => {
  let component: PokemonDetailPage;
  let fixture: ComponentFixture<PokemonDetailPage>;
  let pokemonService: jasmine.SpyObj<PokemonService>;

  beforeEach(() => {
    pokemonService = jasmine.createSpyObj<PokemonService>('PokemonService', [
      'getPokemonDetails',
      'getPokemons',
    ]);
    pokemonService.getPokemonDetails.and.returnValue(of({
      id: 1,
      name: 'bulbasaur',
      sprites: {
        front_default: 'front.png',
        back_default: 'back.png',
        front_shiny: 'front-shiny.png',
        back_shiny: 'back-shiny.png',
        other: { 'official-artwork': { front_default: 'artwork.png' } },
        versions: { 'generation-v': { 'black-white': { animated: { front_default: 'animated.gif' } } } },
      },
      cries: { latest: 'cry.ogg' },
      types: [],
    }));
    pokemonService.getPokemons.and.returnValue(of({ results: [] }));

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, IonicModule.forRoot()],
      declarations: [PokemonDetailPage],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: 'bulbasaur' })) },
        },
        { provide: PokemonService, useValue: pokemonService },
      ],
    });
    fixture = TestBed.createComponent(PokemonDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the selected Pokémon and builds its image gallery', () => {
    expect(pokemonService.getPokemonDetails).toHaveBeenCalledWith('bulbasaur');
    expect(component.galleryImages.length).toBeGreaterThanOrEqual(5);
    expect(component.animatedImageUrl).toBe('animated.gif');
  });
});
