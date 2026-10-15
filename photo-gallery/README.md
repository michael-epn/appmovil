# Photo Gallery

Aplicación móvil de galería fotográfica desarrollada con **Ionic**, **Angular** y **Capacitor**. Permite tomar fotografías con la cámara, verlas en una galería y eliminarlas.

## Funcionalidades

- Capturar fotos con la cámara del dispositivo o del navegador.
- Ver las fotos guardadas en una cuadrícula.
- Eliminar una foto desde el menú de acciones de cada imagen.
- Conservar las fotos y la lista de la galería en el almacenamiento local del dispositivo.
- Navegar por una interfaz con tres pestañas. La pestaña **Photos** contiene la galería; las pestañas **Tab 1** y **Tab 3** conservan por ahora las pantallas de ejemplo de Ionic.

## Tecnologías

- Angular 22
- Ionic Angular 9
- Capacitor 8
- Capacitor Camera, Filesystem y Preferences
- TypeScript y SCSS

## Requisitos

- Node.js y npm
- Android Studio y el SDK de Android para ejecutar la aplicación como app nativa Android

## Instalación y ejecución web

Desde esta carpeta (`photo-gallery`), instala las dependencias y levanta el servidor de desarrollo:

```bash
npm install
ionic serve
```

## Ejecución en Android

El proyecto incluye la plataforma Android configurada con Capacitor. Después de instalar las dependencias, sincroniza el proyecto web con Android y ábrelo en Android Studio:

```bash
ionic build
ionic cap sync android
ionic cap open android
```

Para tomar fotografías en un dispositivo, concede a la aplicación los permisos que solicite el sistema operativo. Tras realizar cambios en la aplicación web, vuelve a ejecutar `ionic build` y `ionic cap sync android` para actualizar el proyecto nativo.

## Estructura principal

```text
src/
└── app/
    ├── services/photo.service.ts  # Captura, almacenamiento y eliminación de fotos
    ├── tab1/                      # Primera pestaña de ejemplo
    ├── tab2/                      # Galería de fotos
    ├── tab3/                      # Tercera pestaña de ejemplo
    └── tabs/                      # Navegación entre pestañas
```
