# Registro de estudiantes — Ionic + Angular Standalone + Firebase

Ejemplo didáctico: formulario con nombre, correo y edad; guarda documentos y lista registros de **Cloud Firestore**, sin login.

## Requisitos

- Node.js compatible con Angular 20 (por ejemplo Node.js 22 LTS)
- npm
- Cuenta y proyecto en Firebase

## 1. Instalar

```bash
npm install
```

## 2. Configurar Firebase

1. Abre Firebase Console y crea un proyecto.
2. Registra una **aplicación Web** y copia los valores `firebaseConfig`.
3. Sustituye los marcadores de `src/environments/environment.ts`.
4. En **Firestore Database**, crea la base de datos.
5. Para una práctica temporal con **datos ficticios**, copia el contenido de `firestore.rules` a la pestaña **Reglas** de Firestore y publícalo.

**Seguridad:** las reglas de demostración permiten lecturas y escrituras anónimas (creación) desde cualquier cliente. No usar datos personales reales, no publicar esta configuración en producción y restringir o eliminar las reglas al terminar la clase. Para una aplicación real, usar Firebase Authentication y reglas restrictivas.

Reglas de firestore:
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /estudiantes/{documento} {

      // Permitir consultar estudiantes
      allow read: if true;

      // Permitir registrar estudiantes
      allow create: if true;

      // No permitir modificar ni eliminar
      allow update, delete: if false;
    }
  }
}

## 3. Ejecutar

```bash
ionic serve
```


También puedes instalar Ionic CLI (`npm install -g @ionic/cli`) y ejecutar `ionic serve`.

## Archivos principales

- `src/app/home/home.page.ts`: lógica del formulario.
- `src/app/home/home.page.html`: interfaz Ionic.
- `src/app/services/firebase.service.ts`: operaciones `addDoc` y `getDocs`.
- `src/environments/environment.ts`: configuración Firebase.

## Actividad de ampliación

Agregar los campos `carrera` y `semestre`, guardarlos en Firestore y mostrarlos en la lista.
