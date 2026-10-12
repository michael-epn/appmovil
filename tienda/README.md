# Tienda App

Aplicación móvil desarrollada con Ionic + Angular + Capacitor para gestionar una experiencia de compra sencilla y moderna. El proyecto simula un flujo de supermercado o tienda de conveniencia en el que el cliente selecciona productos, revisa el carrito, ingresa el monto para pagar y obtiene una factura final con el cambio calculado.

La app está pensada como una solución de demostración para procesos de compra básicos, validación de datos, cálculo de totales y generación de comprobante de pago en una interfaz móvil.

## Descripción general

La aplicación permite:

- Seleccionar productos con cantidades.
- Registrar la cédula del cliente.
- Validar que exista al menos un producto en el carrito antes de continuar.
- Calcular el total final de la compra.
- Ingresar el monto con el que se paga.
- Validar si el dinero entregado es suficiente.
- Mostrar una factura con el detalle del pedido, monto pagado y vuelto.
- Reiniciar la compra para comenzar de nuevo.

## Stack tecnológico

- Angular 22
- Ionic Framework
- Capacitor 8
- TypeScript
- HTML / SCSS
- RxJS
- Angular Signals

## Funcionalidades principales

### 1. Selección de productos
El usuario puede navegar a la pantalla de productos y:

- ver la lista de artículos disponibles,
- incrementar o disminuir cantidades,
- ingresar la cédula del cliente,
- pasar al siguiente paso solo si la información es válida.

### 2. Carrito de compras
La pantalla del carrito muestra:

- nombre del producto,
- cantidad,
- precio unitario,
- subtotal por producto,
- total final de la compra.

También se solicita el monto entregado por el comprador.

### 3. Pago y factura
Al confirmar el pago:

- se valida que el monto sea suficiente,
- se genera la factura de venta,
- se calcula el cambio,
- se visualiza el comprobante final.

### 4. Estado global de la compra
El servicio `DatosService` centraliza la lógica de la compra y mantiene los datos relevantes mediante `signal()`, incluyendo:

- cédula del cliente,
- monto de pago,
- productos disponibles,
- cantidades seleccionadas,
- carrito activo,
- total final,
- cambio calculado.

## Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 20 o superior
- npm 10 o superior
- Git
- Android Studio (si deseas compilar para Android con Capacitor)

> Se recomienda usar una versión LTS de Node.js para mantener compatibilidad con Angular 22 y Ionic 9.

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd tienda
```

2. Instala las dependencias:

```bash
npm install
```

3. Verifica que el proyecto se haya configurado correctamente:

```bash
npm run build
```

## Ejecución local

Para iniciar la aplicación en modo desarrollo:

```bash
npm start
```

Esto ejecuta Angular en modo desarrollo y normalmente queda disponible en:

```text
http://localhost:4200
```

Si prefieres hacerlo explícitamente con el CLI de Angular:

```bash
npx ng serve
```

## Scripts disponibles

En `package.json` se incluyen los siguientes scripts:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "lint": "ng lint"
  }
}
```

### Comandos útiles

- Ejecutar la app:

```bash
npm start
```

- Compilar para producción:

```bash
npm run build
```

- Ejecutar pruebas:

```bash
npm test
```

- Revisar lint:

```bash
npm run lint
```

## Compilación y despliegue Android con Capacitor

El proyecto está preparado para funcionar con Capacitor y generar una aplicación nativa Android.

### 1. Agregar la plataforma Android

```bash
npx cap add android
```

### 2. Sincronizar cambios con la plataforma

```bash
npm run build
npx cap sync android
```

### 3. Abrir Android Studio

```bash
npx cap open android
```

### 4. Construcción desde Android Studio

Puedes compilar, firmar y publicar la app desde Android Studio según el flujo de distribución de tu entorno.

## Estructura del proyecto

```text
tienda/
├── android/                     # Proyecto nativo Android generado por Capacitor
├── src/                        # Código fuente de la aplicación
│   ├── app/
│   │   ├── services/
│   │   │   └── datos.ts        # Lógica central de productos, pago y carrito
│   │   ├── tabs/
│   │   ├── tab1/
│   │   ├── tab2/
│   │   ├── tab3/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── ...
│   ├── environments/
│   ├── global.scss
│   ├── index.html
│   ├── main.ts
│   └── theme/
├── capacitor.config.ts         # Configuración de Capacitor
├── angular.json                 # Configuración del proyecto Angular
├── ionic.config.json            # Configuración del proyecto Ionic
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración de TypeScript
├── eslint.config.js             # Reglas de linting
├── .gitignore
├── README.md                    # Documentación del proyecto
└── ...
```

## Flujo de uso típico

1. El usuario abre la app.
2. Ingresa la cédula del cliente.
3. Selecciona los productos y cantidades deseadas.
4. Confirma la compra y accede al carrito.
5. Ingresa el monto recibido.
6. El sistema valida el pago y calcula el cambio.
7. Se muestra la factura final con el resumen de la compra.
8. El usuario puede reiniciar la compra para comenzar otra operación.

## Datos y lógica de negocio

El servicio `DatosService` incluye una serie de señales reactivas:

- `cedula`: guarda la identificación del cliente.
- `montoPago`: almacena el valor entregado para pagar.
- `productos`: contiene la lista de artículos disponibles y sus cantidades.
- `productosEnCarrito`: calcula qué productos tienen al menos una unidad seleccionada.
- `totalFinal`: suma el total del carrito.
- `cambio`: calcula el dinero que debe devolver el vendedor.

Esto permite que la UI se actualice automáticamente cuando cambia el estado de la compra.

## Personalización

Puedes adaptar este proyecto para:

- cambiar la lista de productos,
- modificar precios,
- cambiar textos de la UI,
- agregar descuentos,
- integrar persistencia de datos,
- conectar con backend o APIs,
- usar un flujo más completo de ventas.

## Buenas prácticas sugeridas

- Mantén la lógica de negocio en servicios dedicados.
- Usa validaciones antes de avanzar entre pantallas.
- Evita duplicar cálculos de total y cambio en múltiples componentes.
- Si el proyecto crece, considera separar productos, carrito y facturación en modelos más robustos.

## Notas de desarrollo

Este proyecto es una base clara para una app de ventas de tipo point-of-sale (POS) o compra rápida, pero aún puede ampliarse con:

- autenticación de usuarios,
- gestión de inventario,
- historial de ventas,
- persistencia local con SQLite o Capacitor Storage,
- integración con pagos electrónicoss,
- despliegue para iOS y Android.

## Conclusión

`tienda` es una aplicación móvil funcional de tipo compra y facturación, construida con Ionic, Angular y Capacitor. Su estructura es simple, clara y adecuada para aprender la lógica de una app de comercio básica, con navegación por tabs, cálculo de totales y generación de comprobantes.

Si deseas, este proyecto puede convertirse fácilmente en una solución más completa con backend, catálogo dinámico, autenticación, inventario y pagos reales.
