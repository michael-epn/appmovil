# Ubicación Simple

Aplicación móvil para consultar la ubicación del dispositivo y registrar un seguimiento GPS. Está construida con Angular 20, Ionic 8 y Capacitor 7, y puede ejecutarse en el navegador o como aplicación Android.

## Funcionalidades

- Solicita permiso de ubicación al abrir la pantalla **Ubicación** y muestra latitud y longitud.
- Permite volver a consultar la posición actual.
- Inicia y detiene un seguimiento GPS de alta precisión.
- Registra en memoria el punto de origen, la posición actual, los puntos intermedios recibidos durante el seguimiento y el destino al detenerlo.
- Muestra la ubicación y la ruta en Google Maps mediante enlaces externos.
- Permite guardar un archivo `ubicacion-ruta.txt` con las coordenadas de origen, destino y ubicación actual, además de los enlaces a Google Maps. En Android se escribe en el directorio Documents; en el navegador se descarga.

La pestaña **Ruta** puede mostrar la posición actual aunque no haya una ruta iniciada. Para generar un enlace de ruta y habilitar la exportación del archivo, primero inicia un seguimiento en **Ubicación**. Mientras el seguimiento está activo, el enlace de Google Maps incluye hasta tres puntos intermedios seleccionados de los registrados.

## Tecnologías

- Angular 20 y TypeScript
- Ionic 8 e Ionicons
- Capacitor 7
- `@capacitor/geolocation` para permisos y lecturas GPS
- `@capacitor/filesystem` para guardar el archivo en dispositivos nativos
- Jasmine y Karma para pruebas

## Requisitos

- Node.js y npm compatibles con Angular 20.
- Un navegador moderno para la ejecución web.
- Para Android: Android Studio, Android SDK y un emulador o dispositivo físico configurado.
- Un dispositivo con servicios de ubicación activos. Los emuladores deben tener una ubicación simulada configurada.

## Instalación

Desde la raíz del proyecto:

```bash
npm ci
```

Si no se dispone de un `package-lock.json` válido, se puede instalar con:

```bash
npm install
```

## Ejecución en el navegador

Inicia el servidor de desarrollo:

```bash
ionic serve
```

## Ejecución en Android

El proyecto incluye la plataforma Android en `android/`. Después de instalar las dependencias, compila la aplicación web y sincroniza los recursos y plugins con Android:

```bash
npm run build
npx cap sync android
```

Abre el proyecto nativo en Android Studio:

```bash
npx cap open android
```

Desde Android Studio, selecciona un emulador o dispositivo conectado y ejecuta la aplicación. Para volver a probar cambios web en Android, repite `npm run build` y `npx cap sync android` antes de ejecutar la aplicación nativa.

Android declara permisos de ubicación precisa y aproximada. La aplicación solicita el permiso de ubicación en tiempo de ejecución; el usuario debe concederlo para consultar o seguir su posición. La exportación utiliza el plugin Filesystem y el directorio Documents.

## Uso

1. Abre **Ubicación** y concede el permiso solicitado.
2. Selecciona **Obtener ubicación actual** para actualizar las coordenadas, o **Iniciar seguimiento** para comenzar una ruta.
3. Durante el seguimiento, la posición se actualiza y se añaden puntos intermedios a la sesión en memoria.
4. Selecciona **Detener seguimiento** para registrar la posición final como destino.
5. Abre **Ruta** para consultar las coordenadas y abrir la ubicación o ruta en Google Maps.
6. Selecciona **Guardar enlaces en archivo TXT** para descargar o guardar `ubicacion-ruta.txt`.

Google Maps se abre mediante un enlace externo; para visualizarlo se necesita conexión a Internet y un navegador o aplicación compatible.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo de Angular. |
| `npm run build` | Compila la aplicación para producción en `www/`. |
| `npm run watch` | Compila en modo desarrollo y vuelve a compilar al detectar cambios. |
| `npm test` | Ejecuta las pruebas con Karma y Jasmine. |
| `npm run lint` | Ejecuta ESLint sobre los archivos TypeScript y HTML de `src/`. |
| `npx cap sync android` | Sincroniza el contenido web y los plugins con el proyecto Android. |
| `npx cap open android` | Abre el proyecto Android en Android Studio. |

## Estructura principal

```text
src/
  app/
    home/                 Pantalla de coordenadas y control del seguimiento
    tab1/                 Ruta, enlaces a Maps y exportación TXT
    services/
      location.ts         Permisos, lectura GPS y observación de posiciones
      tracking-session.ts Estado en memoria de la sesión y sus coordenadas
    tabs/                 Navegación entre Ubicación y Ruta
  environments/           Configuración de compilación
  assets/                 Recursos estáticos
android/                  Proyecto nativo Android de Capacitor
```

## Datos y limitaciones

- Las coordenadas y puntos de ruta se mantienen en memoria durante la ejecución; no hay persistencia de sesiones en una base de datos.
- El seguimiento está implementado con `Geolocation.watchPosition`. No se configura un servicio de seguimiento en segundo plano; no debe asumirse que seguirá registrando posiciones si el sistema suspende o cierra la aplicación.
- La ruta exportada contiene enlaces y coordenadas de origen, destino y ubicación actual; no exporta la lista completa de puntos intermedios. El enlace de Google Maps incorpora como máximo tres puntos intermedios seleccionados.
- La ubicación requiere permiso del usuario, GPS o servicios de ubicación activos y disponibilidad del proveedor del dispositivo. La precisión real puede variar.
- Las capacidades de almacenamiento y permisos pueden variar entre navegador, versiones de Android y dispositivos.

## Pruebas

Ejecuta las pruebas unitarias con:

```bash
npm test
```

El proyecto usa Karma y Jasmine según la configuración de Angular. Las pruebas pueden requerir Chrome disponible en el equipo.

## Estado del proyecto

La configuración incluida dispone de una aplicación web Angular/Ionic y una plataforma Android de Capacitor. No se incluye una plataforma iOS en el repositorio.
