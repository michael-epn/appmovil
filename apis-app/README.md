# Rick and Morty Characters

Aplicación móvil/web creada con **Ionic y Angular Standalone** que consulta la [Rick and Morty API](https://rickandmortyapi.com/) para buscar y explorar personajes.

## API y paginación

- Listado: `https://rickandmortyapi.com/api/character/`
- Búsqueda por nombre: `https://rickandmortyapi.com/api/character/?name=<nombre>`
- La API devuelve `info.next` con la URL de la siguiente página. La aplicación la solicita al desplazarse mediante `ion-infinite-scroll` y añade los resultados sin repetir personajes por su `id`.
- Cuando `info.next` es `null`, el desplazamiento infinito se deshabilita. Si una búsqueda no encuentra coincidencias, se muestra un mensaje para la respuesta 404.
- La búsqueda por nombre se conserva al actualizar la lista con `ion-refresher`. Las respuestas de cada página y búsqueda se guardan en `localStorage` durante cinco minutos; la actualización manual solicita datos nuevos y renueva la caché.

## Instalación y ejecución local

Requisitos: Node.js y npm. Desde la carpeta del proyecto:

```bash
npm install
npx ionic serve
```

Si Ionic CLI está instalado globalmente, también se puede ejecutar `ionic serve`. Como alternativa, este proyecto incluye el script `npm start`.

## Capturas y GIFs

Adjunta aquí evidencia de la aplicación en funcionamiento:

<!-- Reemplaza estos marcadores por las rutas de las capturas o GIFs. -->
![Listado de personajes](docs/screenshots/characters.png)

![Búsqueda y desplazamiento infinito](docs/screenshots/search-and-pagination.gif)

## Mensaje de commit sugerido

```text
feat(characters): add search and infinite pagination
```
