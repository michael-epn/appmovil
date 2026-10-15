# 📍 MiUbicacionAPP — Ionic + Angular + Capacitor

Aplicación móvil educativa desarrollada con **Ionic**, **Angular** y **Capacitor** para practicar el acceso a la ubicación geográfica del dispositivo.

> **Nota:** El repositorio incluye `@capacitor/geolocation`. Las funciones concretas de la interfaz deben verificarse ejecutando la aplicación; este README no presupone mapas, historial ni seguimiento en segundo plano.

## 🧰 Tecnologías

| Tecnología | Versión declarada | Uso |
|---|---|---|
| Ionic Angular | ^8.0.0 | Componentes e interfaz móvil |
| Angular | ^20.0.0 | Estructura de la aplicación |
| Capacitor | 7.4.3 | Integración con plataformas nativas |
| Capacitor Geolocation | ^7.1.5 | Acceso a la ubicación |
| TypeScript | ~5.8.0 | Desarrollo |

## ✅ Requisitos previos

- Node.js y npm compatibles con Angular 20.
- Ionic CLI (opcional, para ejecutar `ionic serve`).
- Android Studio y SDK de Android si se desea generar una aplicación Android.
- Dispositivo o emulador con servicios de ubicación habilitados.

## 🚀 Instalación y ejecución

```bash
git clone https://github.com/jzaldumbide/MiUbicacionAPP_ionic.git
cd MiUbicacionAPP_ionic
npm install
npm start
```

Abrir la dirección local que muestre Angular (normalmente `http://localhost:4200`). Alternativamente:

```bash
npm install -g @ionic/cli
ionic serve
```

## 📱 Ejecución en Android

La carpeta nativa `android/` no aparece en la raíz publicada del repositorio, por lo que debe generarse antes de compilar.

```bash
npm install @capacitor/android@^7
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

En Android Studio, seleccionar un emulador o dispositivo y ejecutar la aplicación. Para generar un APK de prueba, usar **Build > Build Bundle(s) / APK(s) > Build APK(s)**. Si se modifica el código web, repetir `npm run build && npx cap sync android`.

## 🧭 Geolocalización

El proyecto declara la dependencia `@capacitor/geolocation`. Su API permite solicitar permisos y consultar coordenadas del dispositivo. Un ejemplo **ilustrativo** (no necesariamente idéntico al código del repositorio) es:

```typescript
import { Geolocation } from '@capacitor/geolocation';

async function obtenerUbicacion() {
  const permiso = await Geolocation.requestPermissions();
  if (permiso.location !== 'granted' && permiso.coarseLocation !== 'granted') {
    throw new Error('Permiso de ubicación no concedido');
  }

  const posicion = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000
  });

  console.log('Latitud:', posicion.coords.latitude);
  console.log('Longitud:', posicion.coords.longitude);
  console.log('Precisión (m):', posicion.coords.accuracy);
}
```

En el navegador, la geolocalización normalmente requiere `localhost` o HTTPS y autorización del usuario. En Android se deben revisar los permisos de ubicación del manifiesto y las solicitudes en tiempo de ejecución. La precisión depende del GPS, redes disponibles y configuración del dispositivo.

## 📁 Estructura principal

```text
MiUbicacionAPP_ionic/
├── .vscode/               # Configuración del editor
├── src/                   # Código fuente Angular/Ionic
├── angular.json           # Configuración de Angular
├── capacitor.config.ts    # Configuración de Capacitor
├── ionic.config.json      # Configuración de Ionic
├── package.json           # Dependencias y scripts
├── package-lock.json      # Versiones resueltas de dependencias
└── tsconfig.json          # Configuración de TypeScript
```

## 🧪 Comandos útiles

```bash
npm start          # Servidor de desarrollo Angular
npm run build      # Compilación web
npm test           # Pruebas unitarias
npm run lint       # Revisión estática del código
npx cap sync       # Sincroniza archivos web y plugins nativos
```

## 🔍 Problemas frecuentes

| Problema | Posible solución |
|---|---|
| No se obtiene la ubicación | Activar los servicios de ubicación y conceder permisos. |
| Error de permisos en navegador | Probar desde `localhost` o HTTPS. |
| Ubicación poco precisa | Probar al aire libre y activar alta precisión. |
| Android no aparece como plataforma | Instalar `@capacitor/android` y ejecutar `npx cap add android`. |
| Los cambios no aparecen en Android | Ejecutar `npm run build` y `npx cap sync android`. |

## 📸 Capturas de pantalla

Para documentar la interfaz, crear una carpeta `screenshots/` y agregar imágenes reales de la aplicación:

```markdown
![Pantalla principal](screenshots/pantalla-principal.png)
![Ubicación obtenida](screenshots/ubicacion.png)
```

## 🎓 Propósito académico

Proyecto de referencia para prácticas de desarrollo móvil con Ionic, Angular, Capacitor y acceso a funcionalidades del dispositivo. Se recomienda experimentar con permisos, manejo de errores, precisión y pruebas en dispositivos reales.

## 👨‍🏫 Autor

**Juan Pablo Zaldumbide**  
Docente — ESFOT, Escuela Politécnica Nacional (EPN)

**Repositorio:** https://github.com/jzaldumbide/MiUbicacionAPP_ionic

---

*La información de dependencias y estructura se basa en los archivos públicos visibles del repositorio. Las instrucciones de Android y el ejemplo de geolocalización son guías de uso, no una afirmación de funcionalidades ya implementadas.*
