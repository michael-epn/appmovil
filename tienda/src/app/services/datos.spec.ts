import { TestBed } from '@angular/core/testing';
import { DatosService } from './datos';

describe('DatosService', () => {
    let service: DatosService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DatosService);
    });

    it('debe crearse correctamente', () => {
        expect(service).toBeTruthy();
    });

    it('debe incrementar la cantidad y recalcular el totalFinal', () => {
        service.incrementar(1);
        service.incrementar(1);

        expect(service.productos()[0].cantidad).toBe(2);
        expect(service.totalFinal()).toBe(2.40);
        expect(service.productosEnCarrito().length).toBe(1);
    });

    it('no debe permitir cantidades menores a 0 al decrementar', () => {
        service.decrementar(1);
        expect(service.productos()[0].cantidad).toBe(0);
    });

    it('debe reiniciar todos los valores al estado inicial', () => {
        service.cedula.set('1234567890');
        service.incrementar(1);
        service.montoPago.set(10);

        service.reiniciar();

        expect(service.cedula()).toBe('');
        expect(service.montoPago()).toBe(0);
        expect(service.totalFinal()).toBe(0);
        expect(service.productosEnCarrito().length).toBe(0);
    });
});