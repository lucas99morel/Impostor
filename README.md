# Link del Juego:

https://impostordeliqui.netlify.app/

# El Impostor

Juego de fiesta tipo "impostor" para jugar en un solo dispositivo, pasándolo de mano en mano. Un jugador es el impostor y no conoce la palabra secreta; el resto sí. Entre todos dan pistas, debaten y votan quién creen que es el impostor.

> Hecho 100% con **HTML, JavaScript vanilla y Tailwind CSS**.

## Características

* **Partida Rápida**: elegís cantidad de jugadores y categoría, y arranca al toque (sin nombres, sin reloj).
* **Partida Configurada**: cargá los nombres de los jugadores, elegí categoría y configurá un temporizador para el debate (o jugá sin reloj).
* **Editor de Categorías**: agregá, renombrá o eliminá categorías y palabras propias. Los cambios se guardan en el navegador (`localStorage`), y podés restaurar las categorías originales cuando quieras.
* **Votación integrada**: al terminar el tiempo (o al cortar manualmente), se abre una pantalla para acusar y revelar quién era el impostor.
* Se recuerdan los nombres de los últimos jugadores cargados para no tener que escribirlos de nuevo.

## Cómo se juega

1. Elegí **Partida Rápida** o **Configurar Partida**.
2. El dispositivo va pasando de jugador en jugador: cada uno ve en privado si es inocente (con la palabra secreta) o el impostor.
3. Por turnos, cada jugador da una pista relacionada a la palabra sin decirla directamente. El impostor debe disimular.
4. Cuando se acaba el tiempo (o alguien corta antes), se vota a quién se expulsa.
5. Se revela si acertaron o si el impostor se salió con la suya.

## Tecnologías

* HTML5
* JavaScript (Vanilla)
* Tailwind CSS 4
* SweetAlert2 para los modales y confirmaciones
* Font Awesome para los íconos

## Instalación y uso

El proyecto no requiere un backend para funcionar. El archivo `dist/output.css` ya viene compilado, por lo que podés jugar directamente.

1. Cloná el repositorio:

```bash
git clone https://github.com/lucas99morel/Impostor.git
cd Impostor
```

2. Instalá las dependencias:

```bash
npm install
```

3. Abrí `index.html` en tu navegador (doble clic o utilizando la extensión **Live Server** de Visual Studio Code).

### Desarrollo con Tailwind CSS

Si modificás los estilos, ejecutá el compilador en modo observación:

```bash
npm run dev
```

Esto recompilará automáticamente `dist/output.css` cada vez que guardes cambios.

### Generar la versión optimizada

Para generar una versión minificada del CSS:

```bash
npm run build
```

## Notas

* Los jugadores y las categorías personalizadas se almacenan en el `localStorage` del navegador, por lo que permanecen guardados únicamente en ese dispositivo.
* Se requieren al menos **3 jugadores** para jugar en el modo configurado.
