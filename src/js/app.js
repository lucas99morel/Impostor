// Banco de Palabras por Categoría
const WORD_CATEGORIES = {
    "Animales": ["Elefante", "Jirafa", "Pingüino", "León", "Mosquito", "Dinosaurio", "Ballena"],
    "Lugares": ["Hospital", "Escuela", "Playa", "Cementerio", "Cine", "Supermercado", "Gimnasio"],
    "Objetos": ["Licuadora", "Espejo", "Martillo", "Guitarra", "Reloj", "Paraguas", "Computadora"],
    "Comida": ["Pizza", "Sushi", "Hamburguesa", "Helado", "Chocolate", "Tacos", "Ensalada"],
    "Profesiones": ["Doctor", "Bombero", "Payaso", "Astronauta", "Profesor", "Futbolista", "Cocinero"]
};

function validarTimer(time,min = 0, max = 59){
    return time >= min && time <= max;
};

document.addEventListener("DOMContentLoaded", () => {
    //Cargar las categorias al <select>
    selectsCategorias = document.querySelectorAll('.select-categorias');

    selectsCategorias.forEach( selectCategorias => {

        Object.keys(WORD_CATEGORIES).forEach(categoria => {
            const option = document.createElement('OPTION');
            option.value = categoria;
            option.textContent = categoria.toUpperCase();
        
            selectCategorias.appendChild(option);
            selectCategorias.addEventListener("change", (e) => {
                game.state.category = e.target.value;
                console.log(game.state.category)
            });
        });
    });

    //Configurar Timer
    let minutesInput = document.getElementById('minutes');
    minutesInput.addEventListener('change', () => {
        if(Number(minutesInput.value) > 10){
            minutesInput.value = '10';
            return;
        }

        if(Number(minutesInput.value) < 0){
            minutesInput.value = '0';
            return;
        }
    });

    let secondsInput = document.getElementById('seconds');
    secondsInput.addEventListener('change', () => {
        if(Number(secondsInput.value) > 59){
            secondsInput.value = '59';
            return;
        }

        if(Number(secondsInput.value) < 0){
            secondsInput.value = '0';
            return;
        }
    });

    let aux;
    const incrementMinutes = document.getElementById('increment-minutes');
    incrementMinutes.addEventListener('click', () => {
        aux = Number(minutesInput.value) + 1;
        if (!validarTimer(aux, 10)){
            return;
        }
        minutesInput.value = String(aux);
    });
    const decrementMinutes = document.getElementById('decrement-minutes');
    decrementMinutes.addEventListener('click', () => {
        aux = Number(minutesInput.value) - 1;
        if (!validarTimer(aux)){
            return;
        }
        minutesInput.value = String(aux);
    });
    const incrementSeconds = document.getElementById('increment-seconds');
    incrementSeconds.addEventListener('click', () => {
        aux = Number(secondsInput.value) + 1;
        if (!validarTimer(aux)){
            return;
        }
        secondsInput.value = String(aux);
    });
    const decrementSeconds = document.getElementById('decrement-seconds');
    decrementSeconds.addEventListener('click', () => {
        aux = Number(secondsInput.value) - 1;
        if (!validarTimer(aux)){
            return;
        }
        secondsInput.value = String(aux);
    });

    //Configurar Cantidad de Jugadores
    let totalPlayersInput = document.getElementById('total-players');
    totalPlayersInput.addEventListener('change', () => {
        if(Number(totalPlayersInput.value) > 20){
            totalPlayersInput.value = '20';
            return;
        }

        if(Number(totalPlayersInput.value) < 3){
            totalPlayersInput.value = '3';
            return;
        }
    });

    const incrementPlayers = document.getElementById('increment-players');
    incrementPlayers.addEventListener('click', () => {
        aux = Number(totalPlayersInput.value) + 1;
        if (!validarTimer(aux, 3, 20)){
            return;
        }
        totalPlayersInput.value = String(aux);
    });
    const decrementPlayers = document.getElementById('decrement-players');
    decrementPlayers.addEventListener('click', () => {
        aux = Number(totalPlayersInput.value) - 1;
        if (!validarTimer(aux,3,20)){
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
    configGame(screenConfigId){
        switch(screenConfigId){
            case '0':
                const codigo = document.querySelector('.config-active').id;
                
                if (['1','screen-partida-rapida'].includes(codigo)){
                    document.getElementById('back-button').classList.add('hidden');
                    document.getElementById('back-button-div').classList.remove('flex');
                    document.getElementById('impostor-title').classList.remove('w-9/10');

                    this.state.players = [];
                    this.showScreen('screen-index');
                }
                else{
                    this.configGame(String(codigo - 1));
                }
                return;
            case '1':
                this.showScreen('screen-config');
                document.getElementById('list-players').innerHTML = '';

                // Cargar jugadores previos si existen
                const saved = localStorage.getItem('impostor_players');
                if(saved) {
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
                this.state.timer = minutes*60 + seconds;
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
                document.getElementById('impostor-title').classList.add('w-9/10')
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

    removePlayerAllToUI(name){
        document.getElementById('list-players').innerHTML = '';
    }

    // --- INICIO DE PARTIDA ---
    prepareGame(rapida = false) {
        document.getElementById('back-button').classList.add('hidden');
        document.getElementById('back-button-div').classList.remove('flex');
        document.getElementById('impostor-title').classList.remove('w-9/10');

        //Partida Rapida
        if(this.state.partidaRapida = rapida){
            this.state.timer = false;
            for (let i=1; i<=Number(document.getElementById('total-players').value); i++){
                this.state.players.push({ id: i, name: `Jugador ${i}`, isImpostor: false, votes: 0 });
            }
        }
        
        console.log(this.state.category);
        if (this.state.category == "Random"){
            this.state.category = Object.keys(WORD_CATEGORIES)[Math.floor(Math.random() * Object.keys(WORD_CATEGORIES).length)];
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
        if(!this.state.partidaRapida){
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
        else{
            document.getElementById('btn-voto').innerHTML = `
                <i class="fas fa-gavel mr-1"></i> Terminar Juego
            `
            document.getElementById('jugadores-title').classList.add('hidden');
        }

        this.showScreen('screen-round');
        

        if(this.state.timer){
            this.startTimer();
        }
        else{
            document.getElementById('timer-title').classList.add('hidden');
            document.getElementById('timer').innerText = "Sin Reloj";
            document.getElementById('btn-timer').classList.add('hidden');
        }
    }

    startTimer() {
        this.state.timer = this.state.timer; 
        this.state.isPaused = false;
        this.updateTimerDisplay();
        
        if(this.state.timerInterval) clearInterval(this.state.timerInterval);
        
        this.state.timerInterval = setInterval(() => {
            if(!this.state.isPaused) {
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
        if (this.state.partidaRapida){
            for (let i=1; i<=Number(document.getElementById('total-players').value); i++){
                this.state.players.pop();
            }   
            this.resetGame();
            return;
        }

        clearInterval(this.state.timerInterval);
        const list = document.getElementById('voting-list');
        list.innerHTML = this.state.players.map(p => `
            <button onclick="game.castVote('${p.id}')" class="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded flex justify-between items-center group transition">
                <span class="font-bold text-lg">${p.name}</span>
                <span class="text-xs bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">ACUSAR</span>
            </button>
        `).join('');
        this.showScreen('screen-voting');
    }

    castVote(accusedId) {
        // Simplificación: Un voto mata en este demo, o se puede hacer conteo.
        // Para hacerlo ágil, usaremos SweetAlert para confirmar voto masivo o individual.
        // Aquí haremos lógica simple: Click = Acusado por la mayoría.
        
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
        if(this.state.partidaRapida){
            this.showScreen('screen-index');
            return;
        }

        document.getElementById('list-players').innerHTML = '';
        this.state.players = [];
        this.configGame('1');
    }
}

function handleEnter(e) {
    if (e.key === 'Enter') game.addPlayer();
}

// Inicializar Juego
const game = new ImpostorGame();

