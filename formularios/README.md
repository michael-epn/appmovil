# Registro de candidatos

Aplicación MVP de reclutamiento creada con Ionic, Angular Standalone y Firebase Cloud Firestore. Permite registrar candidatos mediante un formulario reactivo y consultar sus registros en una segunda vista.

## Funcionalidades

- Formulario de registro con validación de datos y consentimiento.
- Guardado en la colección Firestore `candidatos`.
- Asignación de `creadoEn` mediante `serverTimestamp()` al crear el documento.
- Listado de candidatos en `/candidatos` y detalle expandible con un acordeón.
- Estados de carga y notificaciones de éxito o error.

## Tecnologías

- Angular 20 y TypeScript.
- Ionic 8, con componentes standalone.
- Angular Reactive Forms.
- Firebase JS SDK modular 12 y Cloud Firestore.

## Requisitos

- Node.js compatible con Angular 20.
- npm.
- Un proyecto Firebase con Cloud Firestore habilitado.

## Instalación y ejecución

Instala dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm start
```

También se puede iniciar en `localhost:8100` con:

```bash
npm run ionic:serve
```

Verifica la compilación de producción con:

```bash
npm run build
```

## Configuración de Firebase

1. Crea o selecciona un proyecto en Firebase Console y registra una aplicación web.
2. Crea una base de datos de Cloud Firestore.
3. Configura los valores `firebase` de `src/environments/environment.ts` con la configuración de la aplicación.
4. Firebase se inicializa con la API modular en `src/main.ts`, donde también se configura Firestore y el enrutamiento.
5. Antes de probar el guardado o la lectura, configura reglas de Firestore que permitan a los usuarios autorizados acceder a `candidatos`.

La configuración web de Firebase se utiliza en el cliente y no equivale a una credencial de administrador. Las reglas de Firestore son las que controlan el acceso a los datos.

### Estado actual de las reglas

El archivo `firestore.rules` es heredado y solo contiene una regla para la colección `estudiantes` (lectura y creación anónimas). La aplicación actual usa `candidatos`, así que esas reglas no autorizan la lectura ni la escritura de los candidatos. Firestore denegará esas operaciones hasta que las reglas se actualicen. Las demás colecciones se deniegan por defecto.

No despliegues reglas de acceso anónimo para almacenar datos reales: los documentos contienen información personal y profesional. Para pruebas sin autenticación, utiliza Firebase Emulator y datos ficticios.

Como punto de partida después de implementar Firebase Authentication y asignar una custom claim `admin` desde un entorno confiable, las reglas podrían ser:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /candidatos/{candidatoId} {
      allow read, write: if request.auth != null
                         && request.auth.token.admin == true;
    }

    match /{documento=**} {
      allow read, write: if false;
    }
  }
}
```

Estas reglas son solo una referencia para un flujo administrativo autenticado; no habilitan el formulario actual mientras la aplicación no tenga autenticación.

## Modelo de datos

La interfaz `Candidato` está definida en `src/app/models/candidato.ts`. Los documentos de `candidatos` contienen:

| Campo | Tipo |
| --- | --- |
| `nombres`, `correo`, `telefono`, `cargo`, `nivelAcademico`, `modalidad`, `resumen` | `string` |
| `fechaNacimiento`, `fechaDisponibilidad` | `string` |
| `experienciaAnios`, `aspiracionSalarial` | `number` |
| `habilidades` | `string[]` |
| `consentimiento` | `boolean` |
| `creadoEn` | `Date \| Timestamp` en la interfaz; se escribe como timestamp de servidor en Firestore |

El formulario valida, entre otros requisitos, correo y teléfono, fechas no futuras/pasadas, experiencia entre 0 y 50 años, al menos una habilidad, resumen de al menos 30 caracteres y consentimiento aceptado.

## Estructura principal

- `src/app/home/`: formulario de registro.
- `src/app/candidatos/`: consulta de candidatos y detalle expandible.
- `src/app/models/candidato.ts`: modelo TypeScript del candidato.
- `src/app/services/candidatos.service.ts`: métodos `agregarCandidato()` y `obtenerCandidatos()`.
- `src/app/services/firestore.token.ts`: token de inyección de la instancia Firestore.
- `src/environments/environment.ts`: configuración Firebase del entorno.
- `src/main.ts`: inicialización de Firebase, Firestore y rutas (`/` y `/candidatos`).
- `firestore.rules`: reglas de seguridad de Firestore.
