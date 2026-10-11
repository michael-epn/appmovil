# Contador Tabs

Aplicación educativa desarrollada con Ionic, Angular y Capacitor para practicar entrada de datos, eventos, validaciones, navegación entre pestañas y estado compartido mediante un servicio con señales de Angular.

En la primera pestaña, el usuario escribe su nombre y modifica un contador. Al pulsar **Enviar al resumen**, la aplicación guarda ambos valores y abre la segunda pestaña para mostrarlos. El proyecto también incluye la configuración de una pantalla de inicio nativa (*splash screen*).

Repositorio: [jzaldumbide/contador-tabs](https://github.com/jzaldumbide/contador-tabs).

## Contenido

- [Objetivos de aprendizaje](#objetivos-de-aprendizaje)
- [Funcionalidades y alcance](#funcionalidades-y-alcance)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo se comparten los datos](#cómo-se-comparten-los-datos)
- [Navegación](#navegación)
- [Splash screen](#splash-screen)
- [Preparar Android y generar el APK](#preparar-android-y-generar-el-apk)
- [Personalizar el icono](#personalizar-el-icono)
- [Verificación](#verificación)
- [Problemas conocidos y soluciones](#problemas-conocidos-y-soluciones)
- [Actividades propuestas](#actividades-propuestas)
- [Referencias](#referencias)

## Objetivos de aprendizaje

1. Construir interfaces con componentes de Ionic.
2. Enlazar un campo de entrada con una variable mediante `[(ngModel)]`.
3. Ejecutar métodos a partir de eventos `(click)`.
4. Aplicar validaciones y condiciones para evitar valores incorrectos.
5. Compartir información entre páginas con un servicio inyectable.
6. Leer y actualizar señales mediante `signal()` y `.set()`.
7. Navegar con Angular Router.
8. Compilar la aplicación web y preparar un APK de prueba con Capacitor.

## Funcionalidades y alcance

### Pestaña Datos

- Campo para ingresar el nombre.
- Contador inicializado en cero.
- Botones para aumentar, disminuir y reiniciar el contador.
- Bloqueo del botón Disminuir cuando el valor es cero.
- Validación del nombre: una cadena vacía o compuesta únicamente por espacios no se acepta.
- Envío del nombre y del contador al servicio compartido.
- Navegación automática al resumen después de un envío válido.

### Pestaña Resumen

- Saludo con el nombre enviado.
- Visualización del valor enviado del contador.
- Mensaje de orientación cuando todavía no se ha enviado información.

### Alcance actual

Los datos se mantienen en memoria. Se pierden al recargar la página o reiniciar el proceso de la aplicación. No hay base de datos, autenticación, almacenamiento persistente ni llamadas a un servidor.

El resumen representa el **último envío**. Modificar el contador en Datos no cambia el resumen hasta volver a pulsar **Enviar al resumen**. Reiniciar el contador tampoco elimina inmediatamente los datos del servicio.

El repositorio contiene el ejercicio de contador y nombre. Los formularios de compras, descuentos y pagos son una posible ampliación y no forman parte de esta implementación.

## Tecnologías

Versiones declaradas en `package.json` y versiones resueltas relevantes en `package-lock.json` al revisar el proyecto:

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Angular | 22.1.7 | Componentes, formularios, señales e inyección de dependencias |
| Angular CLI | 22.1.8 | Servidor de desarrollo y compilación |
| Ionic Angular | `^9.0.0`; lock: 9.0.7 | Componentes visuales y navegación móvil |
| Capacitor Core | `^8.5.3`; lock: 8.5.3 | Integración con plataformas nativas |
| Capacitor CLI | 8.5.3 | Creación y sincronización del proyecto nativo |
| Splash Screen | `^8.0.2` | Pantalla de inicio nativa |
| TypeScript | `~6.0.0` | Lenguaje de implementación |
| Vitest | `~4.0.18` | Pruebas unitarias |
| ESLint / Angular ESLint | Configurados en el proyecto | Análisis estático |

Los rangos con `^` y `~` permiten variaciones de versión. Para reproducir la instalación registrada, utiliza `npm ci` y conserva `package-lock.json`.

## Requisitos

### Para ejecutar en el navegador

- Git.
- Node.js y npm.
- Un navegador moderno.
- Un editor, por ejemplo Visual Studio Code.

Los paquetes Angular del lockfile declaran este requisito de Node.js:

```text
^22.22.3 || ^24.15.0 || >=26.0.0
```

Utiliza una versión compatible; por ejemplo, Node.js 24.15.0 o una versión posterior de la rama 24. No basta con instalar cualquier versión de Node.js 22.

Comprueba tu entorno:

```bash
node --version
npm --version
git --version
```

### Para generar el APK

- Android Studio compatible con Capacitor 8: 2025.2.1 o posterior.
- Android SDK, herramientas de compilación y licencias instaladas desde Android Studio.
- JDK compatible con el proyecto Android generado. Android Studio incluye uno; úsalo como Gradle JDK.
- Un emulador o teléfono Android para probar.

La compilación por terminal también necesita localizar Java y el Android SDK. Si Android Studio compila correctamente pero la terminal no, revisa la configuración de Java y del SDK antes de cambiar dependencias.

## Instalación y ejecución

### 1. Clonar

```bash
git clone https://github.com/jzaldumbide/contador-tabs.git
cd contador-tabs
```

### 2. Instalar dependencias

```bash
npm ci
```

Si modificas intencionalmente las dependencias, utiliza `npm install` y registra también los cambios de `package-lock.json`. Evita `--force` o `--legacy-peer-deps` como solución inicial a errores de compatibilidad.

### 3. Iniciar el servidor

```bash
npm start
```

Abre la dirección que indique la terminal; normalmente es `http://localhost:4200`. Detén el servidor con **Ctrl + C**.

También puedes utilizar Ionic CLI:

```bash
npm install -g @ionic/cli
ionic serve
```

La dirección y el puerto pueden variar según el comando utilizado. El splash screen nativo se comprueba en Android, no en este servidor web.

### 4. Compilar la aplicación web

```bash
npm run build
```

La configuración de Angular genera los archivos en `www/`. Esta ruta coincide con `webDir: 'www'` en `capacitor.config.ts`.

## Estructura del proyecto

| Archivo o carpeta | Responsabilidad |
| --- | --- |
| `src/main.ts` | Arranque de Angular y proveedores de Ionic y Router |
| `src/app/app.component.*` | Componente raíz |
| `src/app/app.routes.ts` | Carga de las rutas de pestañas |
| `src/app/tabs/tabs.page.*` | Barra inferior de pestañas |
| `src/app/tabs/tabs.routes.ts` | Rutas de Datos y Resumen |
| `src/app/tab1/tab1.page.ts` | Contador, validación y envío |
| `src/app/tab1/tab1.page.html` | Entrada de nombre y botones |
| `src/app/tab2/tab2.page.ts` | Acceso al servicio compartido |
| `src/app/tab2/tab2.page.html` | Visualización del último envío |
| `src/app/services/datos.ts` | Servicio `DatosService` |
| `src/app/tab3/` | Archivos de la plantilla sin ruta activa |
| `src/app/explore-container/` | Componente auxiliar de la plantilla |
| `src/assets/` | Recursos web y favicon |
| `src/theme/variables.scss` | Variables de tema |
| `src/global.scss` | Estilos globales |
| `capacitor.config.ts` | Identidad, directorio web y splash screen |
| `angular.json` | Compilación, servidor, pruebas y lint |
| `package.json` | Dependencias y scripts |
| `package-lock.json` | Versiones resueltas |

La carpeta `android/` y los recursos de iconos personalizados no están incluidos en la revisión del repositorio documentada aquí. Se crean mediante los pasos siguientes.

## Cómo se comparten los datos

### 1. Estado local de la primera pestaña

`Tab1Page` mantiene las variables `nombre`, `contador` y `mensaje`. El campo de nombre usa enlace bidireccional:

```html
<ion-input [(ngModel)]="nombre"></ion-input>
```

Los botones ejecutan métodos con `(click)`. Por ejemplo, `aumentar()` incrementa el contador y `disminuir()` comprueba que sea mayor que cero antes de restar.

### 2. Validación y envío

`enviar()` elimina espacios al inicio y al final mediante `trim()`. Si el nombre queda vacío, muestra un mensaje y termina con `return`.

Cuando el nombre es válido:

```typescript
this.datos.guardar(nombreLimpio, this.contador);
this.router.navigateByUrl('/tabs/tab2');
```

### 3. Servicio compartido

El archivo real se llama `datos.ts` y exporta `DatosService`:

```typescript
@Injectable({ providedIn: 'root' })
export class DatosService {
  nombre = signal('');
  contador = signal(0);
  enviado = signal(false);

  guardar(nombre: string, contador: number): void {
    this.nombre.set(nombre);
    this.contador.set(contador);
    this.enviado.set(true);
  }
}
```

`providedIn: 'root'` permite que las dos páginas inyecten la misma instancia. `.set()` actualiza una señal; llamar a la señal, por ejemplo `datos.nombre()`, obtiene su valor.

### 4. Lectura en Resumen

`Tab2Page` inyecta el servicio:

```typescript
datos = inject(DatosService);
```

Su plantilla consulta `datos.enviado()` con `@if`. Si hay un envío, muestra `datos.nombre()` y `datos.contador()`; en caso contrario, muestra instrucciones.

No se pasan datos mediante parámetros de URL y no se necesita crear una segunda copia del servicio.

## Navegación

| Ruta | Página |
| --- | --- |
| `/` | Redirige a `/tabs/tab1` |
| `/tabs` | Redirige a `/tabs/tab1` |
| `/tabs/tab1` | Datos |
| `/tabs/tab2` | Resumen |

La barra inferior conserva las etiquetas **Tab 1** y **Tab 2** de la plantilla, aunque los encabezados de página muestran Datos y Resumen. Puedes cambiar los textos de `ion-label` en `src/app/tabs/tabs.page.html` sin modificar las rutas.

Los archivos de `tab3` siguen presentes, pero no hay una tercera pestaña ni una ruta activa hacia ellos.

## Splash screen

La configuración actual de `capacitor.config.ts` utiliza:

| Propiedad | Valor configurado |
| --- | --- |
| `appId` | `io.ionic.starter` |
| `appName` | `contador-tabs` |
| `webDir` | `www` |
| `launchShowDuration` | `2000` milisegundos |
| `launchAutoHide` | `true` |
| `backgroundColor` | `#ffffff` |
| `showSpinner` | `true` |
| `androidSpinnerStyle` | `large` |
| `iosSpinnerStyle` | `small` |
| `spinnerColor` | `#999999` |
| `splashFullScreen` / `splashImmersive` | `true` |
| `layoutName` | `launch_screen` |
| `useDialog` | `true` |

El plugin ya está declarado en las dependencias; no es necesario reinstalarlo tras `npm ci`.

La configuración solicita una pantalla de inicio de dos segundos. Algunas opciones corresponden a mecanismos específicos o a la presentación mediante diálogo y no se aplican a la pantalla de arranque del sistema en Android 12 o posterior. En esas versiones, Android utiliza una presentación basada en icono y fondo; no debe esperarse un spinner o una imagen de pantalla completa por el solo hecho de configurar estas propiedades.

`layoutName: 'launch_screen'` tampoco crea un archivo de layout. Si se utiliza una presentación que necesita ese recurso, debe existir en el proyecto Android; de lo contrario, elimina esa opción o crea el recurso correspondiente.

Para comprobarlo:

1. Compila y sincroniza el proyecto Android.
2. Instala la aplicación.
3. Cierra por completo la aplicación y ábrela desde su icono.
4. Comprueba el arranque en el dispositivo objetivo.

Cambiar `capacitor.config.ts` requiere sincronización y una nueva compilación nativa.

## Preparar Android y generar el APK

### Primera preparación después de clonar

El repositorio no declara `@capacitor/android`. Instala una versión de la rama 8, compatible con Capacitor Core:

```bash
npm install @capacitor/android@8
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

`npx cap add android` se ejecuta solo cuando todavía no existe la plataforma. Los comandos anteriores se ejecutan desde la raíz del proyecto.

En Android Studio, espera la sincronización de Gradle e instala los componentes del SDK que solicite. Puedes ejecutar la app con **Run** en un emulador o dispositivo conectado.

### APK de depuración por terminal

En macOS o Linux:

```bash
cd android
./gradlew assembleDebug
```

En Windows PowerShell:

```powershell
cd android
.\gradlew.bat assembleDebug
```

El archivo se genera en esta ruta, relativa a la raíz del proyecto:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Transfiere el APK al teléfono e instálalo autorizando esa fuente cuando Android lo solicite. Si tienes ADB configurado, también puedes instalarlo desde la raíz del proyecto:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Este APK está destinado a pruebas. Para publicar, prepara una versión de lanzamiento firmada y el formato requerido por la tienda; `assembleDebug` no realiza ese proceso.

### Después de modificar el código

Desde la raíz del proyecto:

```bash
npm run build
npx cap sync android
```

Después vuelve a compilar el APK desde `android/`. Si omites la compilación web o la sincronización, el APK puede conservar una versión anterior de la interfaz.

## Personalizar el icono

Este apartado describe una personalización opcional: los recursos y el generador no están incluidos en el proyecto revisado.

1. Prepara un PNG cuadrado, preferentemente de 1024 × 1024 píxeles, con el logo centrado y margen suficiente.
2. Crea una carpeta `assets` en la raíz y guarda la imagen como `assets/logo.png`. Esta carpeta de recursos nativos es distinta de `src/assets`.
3. Asegúrate de haber creado la plataforma Android.
4. Instala el generador y ejecuta:

```bash
npm install --save-dev @capacitor/assets
npx @capacitor/assets generate --android --iconBackgroundColor "#ffffff" --splashBackgroundColor "#ffffff"
npm run build
npx cap sync android
```

El modo de generación con un solo logo crea tanto iconos como recursos de splash. Compila e instala de nuevo el APK para ver el resultado. Para volver a cambiar la imagen, reemplaza `assets/logo.png` y repite la generación.

El favicon web está en `src/assets/icon/favicon.png`; cambiarlo no sustituye el icono del lanzador Android.

## Verificación

### Pruebas manuales

| Caso | Resultado esperado |
| --- | --- |
| Abrir Datos | Contador en cero |
| Pulsar Aumentar tres veces | Contador en 3 |
| Disminuir desde 1 | Contador en 0 y botón deshabilitado |
| Pulsar Reiniciar | Contador en 0 |
| Enviar nombre vacío o espacios | Mensaje de validación; no navega |
| Enviar `Juan Pablo` y 5 | Resumen muestra el nombre y 5 |
| Abrir Resumen antes del primer envío | Mensaje para ingresar datos |
| Volver a Datos, cambiar a 8 y enviar | Resumen muestra 8 |
| Cambiar el contador sin enviar | Resumen conserva el último valor enviado |
| Recargar la aplicación web | Estado compartido vuelve a sus valores iniciales |
| Abrir el APK desde su icono | Comprobar la pantalla de inicio nativa |

### Scripts disponibles

| Comando | Finalidad |
| --- | --- |
| `npm start` | Servidor de desarrollo |
| `npm run build` | Compilación web |
| `npm run watch` | Compilación en modo desarrollo observando cambios |
| `npm test` | Pruebas unitarias |
| `npm test -- --configuration=ci` | Pruebas sin modo observación |
| `npm run lint` | Análisis estático |

Las pruebas existentes provienen en buena parte de la plantilla y no sustituyen las pruebas funcionales anteriores. Hay un error de importación conocido descrito a continuación. La revisión utilizada para elaborar este README fue de código y configuración; no acredita una compilación o ejecución satisfactoria de la app, las pruebas o el APK.

## Problemas conocidos y soluciones

### La prueba del servicio importa una clase inexistente

`src/app/services/datos.spec.ts` importa `Datos`, pero `datos.ts` exporta `DatosService`. Antes de ejecutar la suite, ajusta el import, el tipo y la inyección:

```typescript
import { DatosService } from './datos';

// Dentro del bloque describe:
let service: DatosService;

// Dentro del beforeEach:
service = TestBed.inject(DatosService);
```

El título del `describe` también puede cambiarse a `DatosService`.

### Errores al importar componentes Ionic en páginas standalone

El código revisado importa componentes desde `@ionic/angular`. Si Angular indica que un componente de `imports` no es standalone, usa el punto de entrada específico:

```typescript
import {
  IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/angular/standalone';
```

Revisa las importaciones de los componentes afectados, incluido el contenedor de pestañas. Conserva las importaciones de proveedores y estrategias conforme a la API de Ionic; no hagas una sustitución indiscriminada de todos los imports.

### No existe la plataforma Android

Instala `@capacitor/android@8`, compila la web y ejecuta `npx cap add android`. No ejecutes `add` de nuevo sobre una plataforma ya creada.

### Capacitor no encuentra `www`

Ejecuta `npm run build` y comprueba que terminó correctamente. `webDir` y la salida de `angular.json` deben seguir apuntando a `www`.

### Error de Java, Gradle o Android SDK

Abre el proyecto con Android Studio y revisa Gradle JDK y SDK Manager. Para compilar por terminal, configura `JAVA_HOME` con el JDK utilizado por Gradle y comprueba la ubicación del SDK, habitualmente registrada en `android/local.properties`.

### El APK conserva cambios anteriores

Repite el ciclo de compilación web, sincronización, compilación nativa e instalación. Cambiar archivos fuente sin reconstruir el APK no actualiza la aplicación instalada.

### El resumen no cambia al editar el contador

Es el comportamiento del ejercicio: los valores se copian al servicio al pulsar **Enviar al resumen**. Si se desea actualización inmediata, hay que rediseñar el estado para que el contador se modifique directamente en el servicio.

## Actividades propuestas

Estas mejoras son ejercicios adicionales y no funcionalidades implementadas:

1. Cambiar las etiquetas de la barra inferior a Datos y Resumen.
2. Limitar el contador a 20 y deshabilitar Aumentar al alcanzar ese límite.
3. Agregar un botón que borre los datos compartidos desde Resumen.
4. Incorporar persistencia y comparar el comportamiento antes y después de reiniciar la app.
5. Añadir formularios de producto, cantidad y precio en una pestaña, y de descuento y pago en otra.
6. Escribir pruebas de validación del nombre, disminución desde cero y actualización del servicio.
7. Personalizar icono, colores y pantalla de inicio.

## Referencias

- [Documentación de Ionic](https://ionicframework.com/docs)
- [Navegación Ionic Angular](https://ionicframework.com/docs/angular/navigation)
- [Señales de Angular](https://angular.dev/guide/signals)
- [Formularios de Angular](https://angular.dev/guide/forms)
- [Compatibilidad de versiones de Angular](https://angular.dev/reference/versions)
- [Configuración del entorno Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Plugin Splash Screen](https://capacitorjs.com/docs/apis/splash-screen)
- [Generador de iconos y splash screens](https://github.com/ionic-team/capacitor-assets)


