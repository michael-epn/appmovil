import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  constructor() {}
  contador1: number = 0;
  contador2: number = 0;
  contador3: number = 0;
  contador4: number = 0;
  contador5: number = 0;
  
  primos: number[] = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541];
  
  indicePrimo: number = 0;
  numeroPrimo: number = 0; 

  aumentarMultiplo2(): void { this.contador1 += 2; }
  aumentarMultiplo3(): void { this.contador2 += 3; }
  aumentarMultiplo5(): void { this.contador3 += 5; }
  aumentarMultiplo7(): void { this.contador4 += 7; }
  aumentarMultiplo10(): void { this.contador5 += 10; }

  reiniciar(): void {
    this.contador1 = 0;
    this.contador2 = 0;
    this.contador3 = 0;
    this.contador4 = 0;
    this.contador5 = 0;
    
    this.indicePrimo = 0;
    this.numeroPrimo = 0;
  }

  mostrarSiguientePrimo(): void {
    if (this.indicePrimo < this.primos.length) {
      this.numeroPrimo = this.primos[this.indicePrimo];
      this.indicePrimo++;
    } else {
      this.indicePrimo = 0;
    }
  }
}