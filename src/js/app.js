// Banco de Palabras por Categoría (valores originales, usados para "Restaurar")
const DEFAULT_WORD_CATEGORIES = {
    "Animales": ["Elefante", "Jirafa", "Pingüino", "León", "Mosquito", "Dinosaurio", "Ballena"],
    "Lugares": ["Hospital", "Escuela", "Playa", "Cementerio", "Cine", "Supermercado", "Gimnasio"],
    "Objetos": ["Licuadora", "Espejo", "Martillo", "Guitarra", "Reloj", "Paraguas", "Computadora"],
    "Comida": ["Pizza", "Sushi", "Hamburguesa", "Helado", "Chocolate", "Tacos", "Ensalada"],
    "Profesiones": ["Doctor", "Bombero", "Payaso", "Astronauta", "Profesor", "Futbolista", "Cocinero"]
};

// NUEVO: WORD_CATEGORIES ahora es editable en tiempo de ejecución y se
// persiste en localStorage. Si no hay nada guardado, arranca con las
// categorías por defecto.
function loadCategories() {
    const saved = localStorage.getItem('impostor_categorias');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
                return parsed;
            }
        } catch (e) {
            console.warn('No se pudieron leer las categorías guardadas, se usan las de por defecto.', e);
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_WORD_CATEGORIES));
}

function saveCategories() {
    localStorage.setItem('impostor_categorias', JSON.stringify(WORD_CATEGORIES));
}

let WORD_CATEGORIES = loadCategories();

// Evita inyectar HTML cuando se muestran nombres de categorías/palabras
// escritos por el usuario.
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Reconstruye las opciones de todos los <select> de categorías a partir del
// estado actual de WORD_CATEGORIES. Se llama al cargar la página y cada vez
// que se agrega/borra/renombra algo en el editor.
function refreshCategorySelects() {
    document.querySelectorAll('.select-categorias').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="Random">RANDOM</option>';

        Object.keys(WORD_CATEGORIES).forEach(categoria => {
            const option = document.createElement('OPTION');
            option.value = categoria;
            option.textContent = categoria.toUpperCase();
            select.appendChild(option);
        });

        if (WORD_CATEGORIES[currentValue]) {
            select.value = currentValue;
        } else {
            select.value = 'Random';
            game.state.category = 'Random';
        }
    });
}

function validarTimer(time, min = 0, max = 59) {
    return time >= min && time <= max;
}

document.addEventListener("DOMContentLoaded", () => {
    // Cargar las categorias al <select>. El listener se agrega una sola vez
    // por <select> (no por categoría); refreshCategorySelects() se encarga
    // de reconstruir las <option> cada vez que cambian las categorías.
    document.querySelectorAll('.select-categorias').forEach(selectCategorias => {
        selectCategorias.addEventListener("change", (e) => {
            game.state.category = e.target.value;
            console.log(game.state.category);
        });
    });
    refreshCategorySelects();

    // --- NUEVO: Editor de categorías ---
    document.getElementById('btn-add-categoria').addEventListener('click', () => game.addCategoria());
    document.getElementById('input-nueva-categoria').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') game.addCategoria();
    });
    document.getElementById('btn-reset-categorias').addEventListener('click', () => game.resetCategoriasDefault());

    // Delegación de eventos: como las categorías/palabras las escribe el
    // usuario, no metemos su texto dentro de atributos onclick="" (se
    // rompería con comillas o apóstrofes). En su lugar leemos data-* del
    // elemento más cercano.
    const categoriasList = document.getElementById('categorias-list');
    categoriasList.addEventListener('click', (e) => {
        const card = e.target.closest('[data-categoria]');
        if (!card) return;
        const categoria = card.dataset.categoria;

        if (e.target.closest('.btn-delete-categoria')) {
            game.deleteCategoria(categoria);
        } else if (e.target.closest('.btn-rename-categoria')) {
            game.renameCategoria(categoria);
        } else if (e.target.closest('.btn-delete-palabra')) {
            const palabraEl = e.target.closest('[data-palabra]');
            game.deleteWord(categoria, palabraEl.dataset.palabra);
        } else if (e.target.closest('.btn-add-palabra')) {
            const input = card.querySelector('.input-nueva-palabra');
            game.addWord(categoria, input.value);
        }
    });
    categoriasList.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('input-nueva-palabra')) {
            const card = e.target.closest('[data-categoria]');
            game.addWord(card.dataset.categoria, e.target.value);
        }
    });

    //Configurar Timer
    let minutesInput = document.getElementById('minutes');
    minutesInput.addEventListener('change', () => {
        if (Number(minutesInput.value) > 10) {
            minutesInput.value = '10';
            return;
        }

        if (Number(minutesInput.value) < 0) {
            minutesInput.value = '0';
            return;
        }
    });

    let secondsInput = document.getElementById('seconds');
    secondsInput.addEventListener('change', () => {
        if (Number(secondsInput.value) > 59) {
            secondsInput.value = '59';
            return;
        }

        if (Number(secondsInput.value) < 0) {
            secondsInput.value = '0';
            return;
        }
    });

    let aux;
    const incrementMinutes = document.getElementById('increment-minutes');
    incrementMinutes.addEventListener('click', () => {
        aux = Number(minutesInput.value) + 1;
        if (!validarTimer(aux, 10)) {
            return;
        }
        minutesInput.value = String(aux);
    });
    const decrementMinutes = document.getElementById('decrement-minutes');
    decrementMinutes.addEventListener('click', () => {
        aux = Number(minutesInput.value) - 1;
        if (!validarTimer(aux)) {
            return;
        }
        minutesInput.value = String(aux);
    });
    const incrementSeconds = document.getElementById('increment-seconds');
    incrementSeconds.addEventListener('click', () => {
        aux = Number(secondsInput.value) + 1;
        if (!validarTimer(aux)) {
            return;
        }
        secondsInput.value = String(aux);
    });
    const decrementSeconds = document.getElementById('decrement-seconds');
    decrementSeconds.addEventListener('click', () => {
        aux = Number(secondsInput.value) - 1;
        if (!validarTimer(aux)) {
            return;
        }
        secondsInput.value = String(aux);
    });

    //Configurar Cantidad de Jugadores
    let totalPlayersInput = document.getElementById('total-players');
    totalPlayersInput.addEventListener('change', () => {
        if (Number(totalPlayersInput.value) > 20) {
            totalPlayersInput.value = '20';
            return;
        }

        if (Number(totalPlayersInput.value) < 3) {
            totalPlayersInput.value = '3';
            return;
        }
    });

    const incrementPlayers = document.getElementById('increment-players');
    incrementPlayers.addEventListener('click', () => {
        aux = Number(totalPlayersInput.value) + 1;
        if (!validarTimer(aux, 3, 20)) {
            return;
        }
        totalPlayersInput.value = String(aux);
    });
    const decrementPlayers = document.getElementById('decrement-players');
    decrementPlayers.addEventListener('click', () => {
        aux = Number(totalPlayersInput.value) - 1;
        if (!validarTimer(aux, 3, 20)) {
            return;
        }
        totalPlayersInput.value = String(aux);
    });

});


class ImpostorGame {
    constructor() {
        this.state = {
            players: [], // {id, name, isImpostor, votes} o Cantidad de players
            category: "Random",
            secretWord: "",
            impostorId: null,
            currentPlayerIndex: 0,
            timer: 180, // Segundos
            timerInterval: null,
            partidaRapida: false,
            isPaused: false
        };
    }

    // --- GESTIÓN DE PANTALLAS ---
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    // --- CONFIGURACION DEL JUEGO ---
    configGame(screenConfigId) {
        switch (screenConfigId) {
            case '0':
                const codigo = document.querySelector('.config-active').id;

                if (['1', 'screen-partida-rapida', 'screen-categorias'].includes(codigo)) {
                    document.getElementById('back-button').classList.add('hidden');
                    document.getElementById('back-button-div').classList.remove('flex');
                    document.getElementById('impostor-title').classList.remove('w-9/10');

                    this.state.players = [];
                    this.showScreen('screen-index');
                }
                else {
                    this.configGame(String(codigo - 1));
                }
                return;
            case '1':
                this.showScreen('screen-config');
                document.getElementById('list-players').innerHTML = '';

                // Cargar jugadores previos si existen
                const saved = localStorage.getItem('impostor_players');
                if (saved) {
                    JSON.parse(saved).forEach(p => this.addPlayerToUI(p));
                    this.state.players = JSON.parse(saved).map(n => ({ id: Date.now() + Math.random(), name: n, isImpostor: false, votes: 0 }));
                }

                document.getElementById('back-button').classList.remove('hidden');
                document.getElementById('back-button-div').classList.add('flex');
                document.getElementById('impostor-title').classList.add('w-9/10');
                break;
            case '2':
                if (this.state.players.length < 3) {
                    Swal.fire({ icon: 'warning', title: 'Pocos jugadores', text: 'Se necesitan mínimo 3 jugadores.', background: '#1f2937', color: '#fff' });
                    return;
                }
                break;
            case '4':
                const minutes = Number(document.getElementById('minutes').value);
                const seconds = Number(document.getElementById('seconds').value);
                this.state.timer = minutes * 60 + seconds;
                this.prepareGame();
                return;
            case '5':
                this.state.timer = false;
                this.prepareGame();
                return;
            case 'screen-partida-rapida':
                this.showScreen('screen-partida-rapida');
                document.getElementById('back-button').classList.remove('hidden');
                document.getElementById('back-button-div').classList.add('flex');
                document.getElementById('impostor-title').classList.add('w-9/10');
                // FIX: faltaba este break. Al ser el último case original no se
                // notaba, pero al agregar 'screen-categorias' después, sin este
                // break el código de ese case se ejecutaba también por
                // fallthrough.
                break;
            case 'screen-categorias':
                this.showScreen('screen-categorias');
                document.getElementById('back-button').classList.remove('hidden');
                document.getElementById('back-button-div').classList.add('flex');
                document.getElementById('impostor-title').classList.add('w-9/10');
                this.renderCategoriasEditor();
                break;
        }

        document.querySelectorAll('.config').forEach(el => el.classList.remove('config-active'));
        document.getElementById(screenConfigId).classList.add('config-active');
    }

    addPlayer() {
        const input = document.getElementById('input-player');
        const name = input.value.trim();

        if (!name) return;
        if (this.state.players.some(p => p.name === name)) {
            Swal.fire({ icon: 'error', title: 'Repetido', text: 'Ese nombre ya existe.', background: '#1f2937', color: '#fff' });
            return;
        }

        const player = { id: Date.now(), name: name, isImpostor: false, votes: 0 };
        this.state.players.push(player);
        this.addPlayerToUI(name);

        // Guardar nombres simples para la próxima
        localStorage.setItem('impostor_players', JSON.stringify(this.state.players.map(p => p.name)));
        input.value = "";
        input.focus();
    }

    addPlayerToUI(name) {
        const ul = document.getElementById('list-players');
        const li = document.createElement('li');
        li.className = "flex justify-between items-center bg-gray-700 p-3 rounded fade-in";
        li.innerHTML = `
            <span class="font-medium">${name}</span>
            <button onclick="game.removePlayer('${name}', this)" class="cursor-pointer text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
        `;
        ul.appendChild(li);
    }

    removePlayer(name, btn) {
        this.state.players = this.state.players.filter(p => p.name !== name);
        btn.parentElement.remove();
        localStorage.setItem('impostor_players', JSON.stringify(this.state.players.map(p => p.name)));
    }

    removePlayerAllToUI(name) {
        document.getElementById('list-players').innerHTML = '';
    }

    // --- INICIO DE PARTIDA ---
    prepareGame(rapida = false) {
        document.getElementById('back-button').classList.add('hidden');
        document.getElementById('back-button-div').classList.remove('flex');
        document.getElementById('impostor-title').classList.remove('w-9/10');

        // FIX: se asigna partidaRapida sin usar el resultado como condición
        // (antes era `if (this.state.partidaRapida = rapida)`, una asignación
        // usada como chequeo, frágil y confusa).
        this.state.partidaRapida = rapida;

        // Partida Rapida
        if (this.state.partidaRapida) {
            // FIX: se reseteaba solo al terminar la ronda (con pop en un loop),
            // lo que podía arrastrar jugadores de una partida configurada previa
            // o de una partida rápida anterior. Ahora se resetea acá, antes de
            // generar los jugadores nuevos.
            this.state.players = [];
            for (let i = 1; i <= Number(document.getElementById('total-players').value); i++) {
                this.state.players.push({ id: i, name: `Jugador ${i}`, isImpostor: false, votes: 0 });
            }
        }

        console.log(this.state.category);
        // FIX: además de "Random", contemplamos el caso de que la categoría
        // seleccionada haya sido borrada o editada hasta quedar sin palabras
        // desde el editor de categorías.
        const categoriaInvalida = !WORD_CATEGORIES[this.state.category] || WORD_CATEGORIES[this.state.category].length === 0;
        if (this.state.category == "Random" || categoriaInvalida) {
            const categoriasValidas = Object.keys(WORD_CATEGORIES).filter(c => WORD_CATEGORIES[c].length > 0);
            this.state.category = categoriasValidas[Math.floor(Math.random() * categoriasValidas.length)];
        }

        // 1. Elegir Palabra
        console.log(this.state.players, Math.floor(Math.random() * Object.keys(WORD_CATEGORIES).length));
        console.log(this.state.category);
        console.log(this.state.partidaRapida);
        const words = WORD_CATEGORIES[this.state.category];
        console.log(words);
        this.state.secretWord = words[Math.floor(Math.random() * words.length)];

        // 2. Elegir Impostor
        this.state.players.forEach(p => { p.isImpostor = false; p.votes = 0; });
        const impostorIndex = Math.floor(Math.random() * this.state.players.length);
        this.state.players[impostorIndex].isImpostor = true;
        this.state.impostorId = this.state.players[impostorIndex].id;

        // 3. Iniciar flujo de roles
        this.state.currentPlayerIndex = 0;
        this.updatePassScreen();
        this.showScreen('screen-pass');
    }

    updatePassScreen() {
        const player = this.state.players[this.state.currentPlayerIndex];
        document.getElementById('pass-player-name').innerText = player.name;
    }

    // --- MOSTRAR ROLES ---
    revealRole() {
        const player = this.state.players[this.state.currentPlayerIndex];
        const content = document.getElementById('role-content');

        if (player.isImpostor) {
            content.innerHTML = `
                <div class="text-6xl mb-4">🤫</div>
                <h2 class="text-2xl font-bold text-red-500 mb-2">ERES EL IMPOSTOR</h2>
                <p class="text-gray-300">Finge saber la palabra.</p>
            `;
        } else {
            content.innerHTML = `
                <div class="text-6xl mb-4">🕵️</div>
                <h2 class="text-2xl font-bold text-green-500 mb-2">INOCENTE</h2>
                <p class="text-gray-300">La palabra secreta es:</p>
                <div class="my-6 p-4 bg-gray-700 border-2 border-indigo-500 rounded-lg">
                    <h1 class="text-4xl font-bold text-white tracking-widest uppercase">${this.state.secretWord}</h1>
                </div>
            `;
        }
        this.showScreen('screen-role');
    }

    nextTurn() {
        this.state.currentPlayerIndex++;
        if (this.state.currentPlayerIndex < this.state.players.length) {
            this.updatePassScreen();
            this.showScreen('screen-pass');
        } else {
            this.startRound();
        }
    }

    // --- RONDA DE JUEGO ---
    startRound() {
        // Renderizar lista visual
        if (!this.state.partidaRapida) {
            document.getElementById('jugadores-title').classList.remove('hidden');
            document.getElementById('btn-voto').innerHTML = `
                <i class="fas fa-gavel mr-1"></i> Votar
            `

            const list = document.getElementById('round-players-list');
            list.innerHTML = this.state.players.map(p => `
                <div class="bg-gray-700 p-2 rounded text-center text-sm border border-gray-600">
                    <i class="fas fa-user text-gray-400"></i> ${p.name}
                </div>
            `).join('');
        }
        else {
            document.getElementById('btn-voto').innerHTML = `
                <i class="fas fa-gavel mr-1"></i> Terminar Juego
            `
            document.getElementById('jugadores-title').classList.add('hidden');
        }

        this.showScreen('screen-round');


        if (this.state.timer) {
            this.startTimer();
        }
        else {
            document.getElementById('timer-title').classList.add('hidden');
            document.getElementById('timer').innerText = "Sin Reloj";
            document.getElementById('btn-timer').classList.add('hidden');
        }
    }

    startTimer() {
        this.state.timer = this.state.timer;
        this.state.isPaused = false;
        this.updateTimerDisplay();

        if (this.state.timerInterval) clearInterval(this.state.timerInterval);

        this.state.timerInterval = setInterval(() => {
            if (!this.state.isPaused) {
                this.state.timer--;
                this.updateTimerDisplay();
                if (this.state.timer <= 0) {
                    clearInterval(this.state.timerInterval);
                    this.startVoting();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.state.timer / 60);
        const seconds = this.state.timer % 60;
        document.getElementById('timer').innerText =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    toggleTimer() {
        this.state.isPaused = !this.state.isPaused;
        const btn = document.getElementById('btn-timer');
        btn.innerHTML = this.state.isPaused ? '<i class="fas fa-play mr-1"></i> Reanudar' : '<i class="fas fa-pause mr-1"></i> Pausar';
        btn.className = this.state.isPaused
            ? "flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            : "flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded";
    }

    // --- VOTACIÓN ---
    startVoting() {
        if (this.state.partidaRapida) {
            // FIX: antes se hacía un pop() en loop según el valor actual de
            // total-players (que puede haber cambiado). Ahora simplemente se
            // vacía el array completo, ya que en partida rápida no hay
            // jugadores "guardados" que preservar.
            this.state.players = [];
            this.resetGame();
            return;
        }

        clearInterval(this.state.timerInterval);
        const list = document.getElementById('voting-list');
        list.innerHTML = this.state.players.map(p => `
            <button onclick="game.castVote('${p.id}')" class="cursor-pointer w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded flex justify-between items-center group transition">
                <span class="font-bold text-lg">${p.name}</span>
                <span class="text-xs bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">ACUSAR</span>
            </button>
        `).join('');
        this.showScreen('screen-voting');
    }

    castVote(accusedId) {
        Swal.fire({
            title: '¿Voto final?',
            text: "¿La mayoría cree que este es el impostor?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: `Sí, ¡Muerte a ${this.state.players.find(p => p.id == accusedId).name}!`,
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                this.resolveGame(accusedId);
            }
        });
    }

    // --- RESULTADOS ---
    resolveGame(accusedId) {
        const impostor = this.state.players.find(p => p.id === this.state.impostorId);
        const accused = this.state.players.find(p => p.id == accusedId); // == por tipo string/number

        if (accused.isImpostor) {
            // El impostor fue atrapado
            this.showEndScreen(true, "¡Victoria de los Inocentes!", `Atraparon a ${accused.name}.`);
        } else {
            // Acusaron a un inocente
            this.showEndScreen(false, "¡Ganó el Impostor!", `Expulsaron a ${accused.name} que era inocente. El impostor era ${impostor.name}.`);
        }
    }

    showEndScreen(agentsWin, title, msg) {
        const screen = document.getElementById('screen-result');
        const icon = document.getElementById('result-icon');
        const titleEl = document.getElementById('result-title');
        const msgEl = document.getElementById('result-message');
        const wordEl = document.getElementById('reveal-word');

        if (agentsWin) {
            screen.classList.remove('bg-red-900'); // limpieza
            icon.innerHTML = "🏆";
            titleEl.className = "text-3xl font-bold mb-2 text-green-400";
        } else {
            icon.innerHTML = "😈";
            titleEl.className = "text-3xl font-bold mb-2 text-red-500";
        }

        titleEl.innerText = title;
        msgEl.innerText = msg;
        wordEl.innerText = this.state.secretWord;

        this.showScreen('screen-result');
    }

    resetGame() {
        if (this.state.partidaRapida) {
            this.showScreen('screen-index');
            return;
        }

        document.getElementById('list-players').innerHTML = '';
        this.state.players = [];
        this.configGame('1');
    }

    // --- EDITOR DE CATEGORIAS (NUEVO) ---
    renderCategoriasEditor() {
        const container = document.getElementById('categorias-list');
        const nombres = Object.keys(WORD_CATEGORIES);

        if (nombres.length === 0) {
            container.innerHTML = `<p class="text-gray-400 text-sm text-center">No hay categorías. Agrega una arriba.</p>`;
            return;
        }

        container.innerHTML = nombres.map(categoria => {
            const palabras = WORD_CATEGORIES[categoria];
            return `
                <div class="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600" data-categoria="${escapeHtml(categoria)}">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-lg text-indigo-300 break-all pr-2">${escapeHtml(categoria)}</h3>
                        <div class="flex gap-3 shrink-0">
                            <button class="btn-rename-categoria cursor-pointer text-blue-400 hover:text-blue-300" title="Renombrar">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn-delete-categoria cursor-pointer text-red-400 hover:text-red-600" title="Eliminar categoría">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${palabras.map(p => `
                            <span class="bg-gray-600 px-2 py-1 rounded text-sm flex items-center gap-2" data-palabra="${escapeHtml(p)}">
                                ${escapeHtml(p)}
                                <i class="fas fa-times cursor-pointer btn-delete-palabra text-red-400 hover:text-red-600"></i>
                            </span>
                        `).join('')}
                    </div>
                    <div class="flex gap-2">
                        <input type="text" class="input-nueva-palabra flex-1 p-2 rounded bg-gray-800 text-white border border-gray-600 text-sm" placeholder="Nueva palabra">
                        <button class="btn-add-palabra cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white px-3 rounded text-sm">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    addCategoria() {
        const input = document.getElementById('input-nueva-categoria');
        const nombre = input.value.trim();

        if (!nombre) return;

        const existe = Object.keys(WORD_CATEGORIES).some(c => c.toLowerCase() === nombre.toLowerCase());
        if (existe) {
            Swal.fire({ icon: 'error', title: 'Repetida', text: 'Ya existe una categoría con ese nombre.', background: '#1f2937', color: '#fff' });
            return;
        }

        WORD_CATEGORIES[nombre] = [];
        saveCategories();
        this.renderCategoriasEditor();
        refreshCategorySelects();
        input.value = '';
        input.focus();
    }

    deleteCategoria(categoria) {
        if (Object.keys(WORD_CATEGORIES).length <= 1) {
            Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: 'Debe quedar al menos una categoría.', background: '#1f2937', color: '#fff' });
            return;
        }

        Swal.fire({
            title: `¿Eliminar "${categoria}"?`,
            text: 'Se borrarán todas sus palabras.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then(result => {
            if (!result.isConfirmed) return;

            delete WORD_CATEGORIES[categoria];
            saveCategories();

            if (this.state.category === categoria) {
                this.state.category = 'Random';
            }

            this.renderCategoriasEditor();
            refreshCategorySelects();
        });
    }

    renameCategoria(categoria) {
        Swal.fire({
            title: 'Renombrar categoría',
            input: 'text',
            inputValue: categoria,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then(result => {
            if (!result.isConfirmed) return;
            const nuevoNombre = (result.value || '').trim();

            if (!nuevoNombre || nuevoNombre === categoria) return;

            const existe = Object.keys(WORD_CATEGORIES).some(c => c.toLowerCase() === nuevoNombre.toLowerCase());
            if (existe) {
                Swal.fire({ icon: 'error', title: 'Repetida', text: 'Ya existe una categoría con ese nombre.', background: '#1f2937', color: '#fff' });
                return;
            }

            WORD_CATEGORIES[nuevoNombre] = WORD_CATEGORIES[categoria];
            delete WORD_CATEGORIES[categoria];
            saveCategories();

            if (this.state.category === categoria) {
                this.state.category = nuevoNombre;
            }

            this.renderCategoriasEditor();
            refreshCategorySelects();
        });
    }

    addWord(categoria, palabra) {
        palabra = palabra.trim();
        if (!palabra) return;

        const yaExiste = WORD_CATEGORIES[categoria].some(p => p.toLowerCase() === palabra.toLowerCase());
        if (yaExiste) {
            Swal.fire({ icon: 'error', title: 'Repetida', text: 'Esa palabra ya está en la categoría.', background: '#1f2937', color: '#fff' });
            return;
        }

        WORD_CATEGORIES[categoria].push(palabra);
        saveCategories();
        this.renderCategoriasEditor();
    }

    deleteWord(categoria, palabra) {
        if (WORD_CATEGORIES[categoria].length <= 1) {
            Swal.fire({ icon: 'warning', title: 'No se puede eliminar', text: 'La categoría debe tener al menos una palabra. Si ya no la querés, eliminá la categoría entera.', background: '#1f2937', color: '#fff' });
            return;
        }

        WORD_CATEGORIES[categoria] = WORD_CATEGORIES[categoria].filter(p => p !== palabra);
        saveCategories();
        this.renderCategoriasEditor();
    }

    resetCategoriasDefault() {
        Swal.fire({
            title: '¿Restaurar categorías originales?',
            text: 'Se perderán todos tus cambios.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, restaurar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        }).then(result => {
            if (!result.isConfirmed) return;

            WORD_CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_WORD_CATEGORIES));
            saveCategories();
            this.state.category = 'Random';
            this.renderCategoriasEditor();
            refreshCategorySelects();
        });
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') game.addPlayer();
}

// Inicializar Juego
const game = new ImpostorGame();