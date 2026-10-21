import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { PokemonService } from 'src/app/services/pokemon.service';
import { PokemonListPage } from './pokemon-list.page';

describe('PokemonListPage', () => {
  let component: PokemonListPage;
  let fixture: ComponentFixture<PokemonListPage>;

  beforeEach(() => {
    const pokemonService = jasmine.createSpyObj('PokemonService', ['getPokemons']);
    pokemonService.getPokemons.and.returnValue(of({ results: [] }));
    const router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, IonicModule.forRoot()],
      declarations: [PokemonListPage],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        { provide: Router, useValue: router },
      ],
    });
    fixture = TestBed.createComponent(PokemonListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
