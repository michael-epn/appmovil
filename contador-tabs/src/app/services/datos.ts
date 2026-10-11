import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatosService {
  nombre = signal('');
  apellido = signal('');
  contador = signal(0);
  enviado = signal(false);
  

  guardar(nombre: string, apellido: string, contador: number): void {
    this.nombre.set(nombre);
    this.apellido.set(apellido);
    this.contador.set(contador + 10);
    this.enviado.set(true);
  }
}