# Registro de candidatos — Ionic, Angular Standalone y Firebase

Aplicación MVP para registrar candidatos y consultar los registros almacenados en Cloud Firestore. Está construida con Ionic, Angular Standalone, Reactive Forms y la API modular de Firebase.

## Funcionalidades

- Registro de candidatos con validaciones de formulario:
  - Nombres, correo electrónico, teléfono y fechas.
  - Cargo, nivel académico y modalidad de trabajo.
  - Años de experiencia, habilidades técnicas y aspiración salarial.
  - Resumen profesional y consentimiento para el tratamiento de datos.
- Guardado en la colección `candidatos`. El campo `creadoEn` se asigna con `serverTimestamp()` desde Firestore.
- Consulta de candidatos en la ruta `/candidatos`.
- Resumen de cada candidato en una lista y detalle expandible con un acordeón.
- Indicadores de carga y mensajes para errores de lectura o escritura.

## Requisitos

- Node.js compatible con Angular 20.
- npm.
- Un proyecto de Firebase con Cloud Firestore habilitado.

## Instalación y ejecución

Instala las dependencias:

```bash
npm install
```

Inicia la aplicación:

```bash
npm start
```

También está disponible el comando para servir en el puerto `8100`:

```bash
npm run ionic:serve
```

Genera una compilación:

```bash
npm run build
```

## Configuración de Firebase

1. En Firebase Console, crea o selecciona un proyecto y registra una aplicación web.
2. Crea una base de datos de Cloud Firestore.
3. Configura los valores de la aplicación web en `src/environments/environment.ts`. El proyecto se inicializa en `src/main.ts` con `initializeApp()` y `getFirestore()`.
4. Configura las reglas de Firestore para que únicamente usuarios autorizados puedan leer o escribir la colección `candidatos`.

La configuración web de Firebase se incluye en el cliente y no es una credencial secreta. La protección de los datos depende de las reglas de Firestore y de la autenticación/autorización; no publiques reglas de acceso abierto.

### Estado de las reglas del repositorio

El archivo `firestore.rules` conserva una regla heredada para `estudiantes`: permite lectura y creación anónimas en esa colección. La aplicación actual usa `candidatos`, por lo que las reglas actuales no habilitan sus operaciones y Firestore las rechazará. Las colecciones sin una regla `allow` correspondiente quedan denegadas por defecto.

No despliegues la regla heredada con datos reales. Los candidatos pueden incluir datos personales, teléfono, aspiración salarial y antecedentes profesionales. Para pruebas sin autenticación, usa Firebase Emulator y datos ficticios.

Cuando se implemente Firebase Authentication y se asignen roles desde un entorno confiable, una política base para administradores podría ser:

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

Esta política es una referencia para reemplazar las reglas existentes después de implementar autenticación y la custom claim `admin`; no permite que el formulario actual, sin autenticación, acceda a Firestore.

## Modelo y archivos principales

`Candidato`, definido en `src/app/models/candidato.ts`, contiene:

| Campo | Tipo |
| --- | --- |
| `nombres`, `correo`, `telefono`, `cargo`, `nivelAcademico`, `modalidad`, `resumen` | `string` |
| `fechaNacimiento`, `fechaDisponibilidad` | `string \| Date` |
| `experienciaAnios`, `aspiracionSalarial` | `number` |
| `habilidades` | `string[]` |
| `consentimiento` | `boolean` |
| `creadoEn` | `Date \| Timestamp` |

- `src/app/home/`: formulario de registro de candidatos.
- `src/app/candidatos/`: pantalla de consulta y detalle.
- `src/app/services/candidatos.service.ts`: métodos `agregarCandidato()` y `obtenerCandidatos()` para Cloud Firestore.
- `src/app/services/firestore.token.ts`: token de inyección de la instancia Firestore.
- `src/environments/environment.ts`: configuración Firebase del entorno.
- `src/main.ts`: inicialización de Firebase, Firestore y rutas de la aplicación.
- `firestore.rules`: reglas de seguridad de Firestore.
