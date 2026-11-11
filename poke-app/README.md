# PokeApp

![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?logo=ionic&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-6-119EFF?logo=capacitor&logoColor=white)
![Android](https://img.shields.io/badge/Android-10%20(API%2029)-3DDC84?logo=android&logoColor=white)

PokeApp es una Pokédex móvil construida con Ionic, Angular y Capacitor. Consulta la PokéAPI v2 para buscar especímenes y explorar sus expedientes, parámetros de combate, afinidades elementales y líneas evolutivas. La interfaz Neo-Pokedex combina paneles translúcidos, acentos inspirados en los tipos Pokémon y navegación persistente mediante pestañas.

## Funciones

### Códice Kanto/Nacional

- Consulta y filtra el catálogo disponible en la pantalla principal.
- Abre el **Expediente Biométrico** de cada Pokémon.
- Revisa altura, peso, experiencia, tipos, capacidades, estadísticas y sprites.
- Reproduce el sonido del Pokémon cuando está disponible y explora su galería y animación.
- Conserva el comparador existente de altura, peso y experiencia.

### Coliseo Biométrico

Selecciona dos Pokémon y enfrenta sus valores base de vitalidad, ataque, defensa y velocidad. Las barras comparativas muestran las diferencias y el total señala quién tiene ventaja estadística.

### Oráculo Elemental

Consulta un tipo elemental o un Pokémon para visualizar qué tipos infligen daño x2, x0.5 o x0. Para Pokémon con dos tipos, las afinidades se combinan de acuerdo con sus multiplicadores defensivos.

### Laboratorio Genético

Consulta la cadena de evolución de una especie, sus ramificaciones y condiciones conocidas (nivel, objeto, intercambio, amistad o momento del día). Toca una fase para abrir su **Expediente Biométrico**.

## Arquitectura

La aplicación conserva la arquitectura Angular tradicional con `NgModules` y carga diferida:

```text
AppModule
└── AppRoutingModule
    ├── TabsPageModule
    │   ├── PokemonListPageModule
    │   ├── ColiseoBiometricoPageModule
    │   ├── OraculoElementalPageModule
    │   └── LaboratorioGeneticoPageModule
    └── PokemonDetailPageModule
```

`PokemonService` centraliza las solicitudes HTTP y la composición RxJS. Las operaciones que requieren varias respuestas usan `forkJoin` y `switchMap`. Las rutas de `pokemon-list` se redirigen al Códice para conservar el acceso anterior; el expediente continúa disponible mediante `/pokemon-detail/:id`.

## PokéAPI v2

Base URL: `https://pokeapi.co/api/v2`

| Endpoint | Uso |
|---|---|
| `/pokemon?limit={limit}&offset={offset}` | Catálogo, búsqueda y opciones para comparar |
| `/pokemon/{id-o-nombre}` | Expediente y estadísticas del Pokémon |
| `/type?limit={limit}` | Catálogo de tipos elementales |
| `/type/{id-o-nombre}` | Relaciones de daño y efectividad de un tipo |
| `/pokemon-species/{id-o-nombre}` | Enlace de la especie a su cadena evolutiva |
| `/evolution-chain/{id}` | Etapas y requisitos de evolución |

## Requisitos

- Node.js 20.9 o posterior y npm compatibles con la herramienta `@capacitor/assets` y Angular CLI 18.
- Android Studio y Android SDK para compilar la aplicación nativa.
- API 29 para ejecutar en Android 10. El proyecto mantiene `minSdkVersion 22` y `targetSdkVersion 34`, compatibles con Android 10.
- `assets/icon.png` y `assets/splash.png` como fuentes para generar los recursos nativos.

## Instalación y desarrollo

```bash
npm install
npm start
```

La aplicación web estará disponible en `http://localhost:4200`.

## Splash screen e ícono de Android

El proyecto usa `@capacitor/splash-screen` con `launchAutoHide: false`; la aplicación oculta el splash con una transición de 500 ms y anima la entrada del contenido. `capacitor.config.ts` establece `androidScaleType: 'CENTER_CROP'`.

Instala el plugin y la herramienta de generación de imágenes:

```bash
npm install @capacitor/splash-screen@^6
npm install --save-dev @capacitor/assets
```

Coloca o actualiza los archivos fuente en `assets/icon.png` y `assets/splash.png`. Desde la raíz del proyecto, regenera los recursos Android y sincroniza Capacitor:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

Para compilar la aplicación nativa en Windows:

```powershell
npm run build
Set-Location android
.\gradlew.bat assembleDebug
```

El APK de depuración se genera en `android/app/build/outputs/apk/debug/app-debug.apk`. Para verificar Android 10, ejecuta esa compilación en un emulador o dispositivo con API 29. También puedes abrir la carpeta `android/` en Android Studio y seleccionar un dispositivo API 29.

> La generación de assets y la sincronización de Capacitor actualizan archivos nativos de `android/`. Revisa los cambios antes de incorporarlos al control de versiones.
