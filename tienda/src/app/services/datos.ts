import { Injectable, signal, computed } from '@angular/core';

export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class DatosService {
    cedula = signal<string>('');
    montoPago = signal<number>(0);

    productos = signal<Producto[]>([
        { id: 1, nombre: 'Leche 1L', precio: 1.20, cantidad: 0 },
        { id: 2, nombre: 'Pan de molde', precio: 1.80, cantidad: 0 },
        { id: 3, nombre: 'Queso fresco', precio: 2.50, cantidad: 0 },
        { id: 4, nombre: 'Arroz 1kg', precio: 1.10, cantidad: 0 },
        { id: 5, nombre: 'Aceite 1L', precio: 3.25, cantidad: 0 }
    ]);

    productosEnCarrito = computed(() =>
        this.productos().filter(p => p.cantidad > 0)
    );

    totalFinal = computed(() =>
        this.productos().reduce((total, p) => total + (p.precio * p.cantidad), 0)
    );

    cambio = computed(() => {
        const pago = this.montoPago();
        const total = this.totalFinal();
        return pago >= total ? pago - total : 0;
    });

    incrementar(id: number): void {
        this.productos.update(lista =>
            lista.map(p => p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p)
        );
    }

    decrementar(id: number): void {
        this.productos.update(lista =>
            lista.map(p => p.id === id ? { ...p, cantidad: Math.max(0, p.cantidad - 1) } : p)
        );
    }

    reiniciar(): void {
        this.cedula.set('');
        this.montoPago.set(0);
        this.productos.update(lista =>
            lista.map(p => ({ ...p, cantidad: 0 }))
        );
    }
}