# FireSupaBase

Aplicación móvil híbrida construida con Ionic, Angular Standalone y Capacitor. Combina Firebase Authentication y Cloud Firestore con Supabase Database, Storage y Realtime para autenticación, perfiles y chat multimedia.

## Arquitectura

- **Ionic + Angular Standalone**: interfaz responsive con páginas lazy-loaded y formularios reactivos.
- **Firebase Authentication**: registro, inicio/cierre de sesión y estado de autenticación.
- **Cloud Firestore**: salas y mensajes con actualizaciones en tiempo real.
- **Supabase Database**: tabla `profiles` para sincronizar los UID/correos de Firebase y almacenar datos editables del perfil.
- **Supabase Storage**: buckets `avatars` y `chat-files` para imágenes de perfil y adjuntos.
- **Supabase Realtime Presence**: presencia y estado de escritura por sala.
- **Capacitor**: acceso nativo a cámara, geolocalización y preferencias persistentes.

Firebase y Supabase son servicios separados. Iniciar sesión con Firebase no autentica automáticamente al usuario en Supabase. La integración actual usa el cliente Supabase de la aplicación; configura políticas de acceso apropiadas antes de usar datos reales.

## Funcionalidades

1. **Autenticación y sincronización de perfiles**: registro, inicio/cierre de sesión y estado de sesión con Firebase Authentication; durante el registro se crea o actualiza el perfil de Supabase con el UID de Firebase.
2. **Gestión de perfil y avatar**: edición del nombre y la biografía; selección y carga de la foto en el bucket `avatars`.
3. **Salas en tiempo real**: creación de salas y listado reactivo de documentos de Firestore.
4. **Búsqueda de salas**: filtro por nombre con `ion-searchbar` y debounce.
5. **Chat en tiempo real**: envío y escucha de mensajes de texto ordenados cronológicamente por `createdAt`.
6. **Búsqueda en conversaciones**: filtro local de mensajes por palabra clave.
7. **Envío de imágenes**: captura con Camera, carga a `chat-files` y visualización en el chat.
8. **Envío de archivos**: carga de documentos PDF, DOCX y ZIP con enlace para abrir o descargar.
9. **Ubicación**: compartir coordenadas actuales y abrirlas en Google Maps.
10. **Presencia y escritura**: presencia de usuarios por sala con Supabase Realtime, contador de usuarios en línea e indicador de quién está escribiendo.
11. **Administración de mensajes propios**: mantener pulsado un mensaje para editarlo o eliminarlo.
12. **Interacción y preferencias**: reacciones 👍, ❤️ y 😂, confirmaciones de lectura y tema oscuro persistido con Capacitor Preferences.

## Requisitos

- Node.js compatible con Angular 22 (Node `22.22.3+` o `24.15.0+`).
- npm.
- Ionic CLI para ejecutar `ionic serve` (`npm install --global @ionic/cli` si aún no está instalado).
- Proyecto configurado en Firebase con Authentication (correo/contraseña) y Cloud Firestore habilitados.
- Proyecto Supabase con Database, Storage y Realtime habilitados.
- Para Android: Android Studio, Android SDK y un proyecto Android de Capacitor.

## Instalación y ejecución web

Desde la carpeta del proyecto:

```bash
npm install --legacy-peer-deps
```

La opción `--legacy-peer-deps` es necesaria con las dependencias actuales: el proyecto usa Angular 22 y AngularFire 21 declara peer dependencies para Angular 21. Revisa la compatibilidad de AngularFire antes de actualizar versiones o retirar esta opción.

Crea los archivos de configuración locales a partir de las plantillas:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
```

En Windows PowerShell, usa:

```powershell
Copy-Item src\environments\environment.example.ts src\environments\environment.ts
Copy-Item src\environments\environment.prod.example.ts src\environments\environment.prod.ts
```

Edita ambos archivos locales con la configuración de tus proyectos:

- `supabaseUrl`: URL del proyecto Supabase.
- `supabaseKey`: clave pública `publishable` de Supabase.
- `firebase`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` y `measurementId`.

Los archivos `environment.ts` y `environment.prod.ts` están excluidos por `.gitignore`; no los fuerces al índice. Las plantillas `environment.example.ts` y `environment.prod.example.ts` deben permanecer con marcadores, nunca con valores de un proyecto real.

Después, inicia la aplicación:

```bash
ionic serve
```

Para comprobar la compilación:

```bash
npm run build
```

## Configuración de Supabase

Ejecuta en el SQL Editor para crear la tabla de perfiles y los buckets requeridos:

```sql
create table if not exists public.profiles (
  id text primary key,
  email text not null,
  username text not null,
  avatar_url text,
  bio text not null default '',
  updated_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('chat-files', 'chat-files', true)
on conflict (id) do update
set public = excluded.public;
```

La columna `id` es `text` porque almacena el UID de Firebase. Define las políticas de Row Level Security de `profiles` y las políticas de Storage por separado. Los buckets públicos permiten lectura mediante URL pública; esa visibilidad no restringe quién puede leer los objetos. No uses políticas abiertas en producción.

## Esquema de datos

### Supabase Database

Tabla `public.profiles`:

| Columna      | Tipo             | Uso                         |
| ------------ | ---------------- | --------------------------- |
| `id`         | `text` (PK)      | UID del usuario de Firebase |
| `email`      | `text`           | Correo electrónico          |
| `username`   | `text`           | Nombre visible              |
| `avatar_url` | `text`, nullable | URL pública del avatar      |
| `bio`        | `text`           | Biografía                   |
| `updated_at` | `timestamptz`    | Última actualización        |

### Supabase Storage

| Bucket       | Contenido                             |
| ------------ | ------------------------------------- |
| `avatars`    | Fotos de perfil                       |
| `chat-files` | Imágenes y archivos adjuntos del chat |

### Cloud Firestore

Colección `rooms`, un documento por sala:

| Campo         | Uso                          |
| ------------- | ---------------------------- |
| `id`          | ID del documento             |
| `name`        | Nombre de la sala            |
| `description` | Descripción                  |
| `createdBy`   | UID del creador              |
| `createdAt`   | Marca de tiempo del servidor |

Subcolección `rooms/{roomId}/messages`, un documento por mensaje:

| Campo                    | Uso                                        |
| ------------------------ | ------------------------------------------ |
| `senderId`, `senderName` | Autor del mensaje                          |
| `type`                   | `text`, `image`, `file` o `location`       |
| `text`                   | Texto, vacío para mensajes solo multimedia |
| `fileUrl`, `fileName`    | URL y nombre del adjunto, si aplica        |
| `location`, `lat`, `lng` | Coordenadas de ubicación, si aplica        |
| `reactions`              | Mapa emoji → UIDs que reaccionaron         |
| `edited`                 | Indica si el texto fue editado             |
| `readBy`                 | Lista de UIDs que leyeron el mensaje       |
| `createdAt`              | Marca de tiempo del servidor               |

La presencia y el estado de escritura se mantienen en canales Realtime de Supabase con el nombre `room_{roomId}`; no se guardan en Firestore.

## Ejecución en Android

Si todavía no existe la plataforma Android en el proyecto, agrégala una sola vez:

```bash
npx cap add android
```

Después de configurar `environment.ts`, sincroniza los plugins y el código web:

```bash
npx cap sync android
```

Para abrir el proyecto nativo:

```bash
npx cap open android
```

## Seguridad de configuración

- No subas `src/environments/environment.ts` ni `src/environments/environment.prod.ts`.
- No incluyas claves Supabase `service_role`, secretos privados ni credenciales de servidor en una aplicación cliente.
- Las claves Firebase de cliente y las claves Supabase `publishable` se distribuyen en la app compilada: no son secretos. Restringe las API keys cuando corresponda y protege los datos con reglas de Firestore, RLS de Supabase y políticas de Storage.
- Si una credencial privada llegó a un commit o repositorio remoto, revócala o rótala. Quitar el archivo del último commit no borra el valor del historial existente.

Si los archivos locales ya estaban añadidos a Git, sácalos del índice sin borrar tus copias locales:

```bash
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts
git commit -m "Stop tracking local environment files"
```

Verifica el resultado con:

```bash
git check-ignore -v src/environments/environment.ts src/environments/environment.prod.ts
git ls-files -- src/environments/environment.ts src/environments/environment.prod.ts
```

El primer comando debe mostrar las reglas de `.gitignore`; el segundo no debe listar archivos.
