// ============================================================
// MINIJUEGO SECRETO - Boda Bryan & Katherin
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // Configuración general
    const STORAGE_KEY = "bk_wedding_hearts";
    let score = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    let isGameRunning = false;
    let spawnInterval = null;
    let multiplier = 1; // Para la función x2

    // Elementos del DOM
    const triggerEl = document.getElementById("secret-trigger");
    const rewardsContainer = document.getElementById("secret-rewards");
    const counterContainer = document.getElementById("minigame-counter");
    const counterText = document.getElementById("minigame-score-text");
    
    // Contenedor principal de corazones
    const gameContainer = document.createElement("div");
    gameContainer.id = "minigame-container";
    document.body.appendChild(gameContainer);

    // Sistema de Audio Sintético (Pling) - ¡No requiere mp3!
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playPling() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        // Tono agudo y corto
        osc.frequency.setValueAtTime(900, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volumen suave (0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    // Inicializar el observador para saber cuándo llegan al final
    function initGameObserver() {
        if (!triggerEl) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isGameRunning) {
                    // Espera 2 segundos después de ver el texto antes de iniciar
                    setTimeout(() => startGame(), 2000);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(triggerEl);
        
        // Comprobar recompensas previas al cargar
        checkMilestones(true); 
    }

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;
        
        // Genera un corazón cada X tiempo (entre 1 y 3 por segundo aprox)
        spawnInterval = setInterval(createHeart, 600);
    }

    function createHeart() {
        // Limitar máximo en pantalla para no saturar celulares
        if (gameContainer.childElementCount > 12) return;

        const wrapper = document.createElement("div");
        const inner = document.createElement("div");
        
        wrapper.className = "heart-wrapper";
        inner.className = "heart-inner";

        // Determinar tipo (Dorado o Normal) - 2% de probabilidad de Dorado
        const isGold = Math.random() < 0.02; 
        
        if (isGold) {
            inner.innerHTML = "💛";
            inner.style.fontSize = "35px";
            wrapper.dataset.value = 10; // Vale 10 puntos
        } else {
            inner.innerHTML = "💙";
            // Tamaño aleatorio: más grande = cae más rápido (como hojas pesadas)
            const size = Math.random() * 20 + 15; // Entre 15px y 35px
            inner.style.fontSize = `${size}px`;
            wrapper.dataset.value = 1;
            
            // Duración de caída (inversa al tamaño)
            const fallDuration = (55 - size) / 3; // Caerá entre 6s y 13s
            wrapper.style.animationDuration = `${fallDuration}s`;
        }

        // Posición inicial horizontal aleatoria
        wrapper.style.left = `${Math.random() * 90}vw`;
        
        // Velocidad del vaivén aleatoria
        inner.style.animationDuration = `${Math.random() * 2 + 1.5}s`;

        wrapper.appendChild(inner);
        gameContainer.appendChild(wrapper);

        // Interacción: tocar o hacer click
        wrapper.addEventListener("pointerdown", handleHeartClick);

        // Destruir elemento cuando salga de la pantalla (evita lag)
        wrapper.addEventListener("animationend", (e) => {
            if(e.animationName === "fall") {
                wrapper.remove();
            }
        });
    }

    function handleHeartClick(e) {
        const wrapper = e.currentTarget;
        if (wrapper.classList.contains("popped")) return; // Evita doble toque

        // 1. Reproducir sonido y animar pop
        playPling();
        wrapper.classList.add("popped");
        
        // Destello (Opcional, cambiando a estrellas)
        wrapper.querySelector('.heart-inner').innerHTML = "✨";

        // 2. Sumar puntos
        const points = parseInt(wrapper.dataset.value) * multiplier;
        score += points;
        localStorage.setItem(STORAGE_KEY, score);

        // 3. Mostrar el contador en la esquina superior derecha
        showFloatingCounter(score);

        // 4. Verificar si desbloqueó algo
        checkMilestones();

        // 5. Eliminar elemento después de la animación de pop (200ms)
        setTimeout(() => wrapper.remove(), 250);
    }

    let counterTimeout;
    function showFloatingCounter(currentScore) {
        // Remover clase para reiniciar animación si ya estaba visible
        counterContainer.classList.remove("counter-animate");
        
        // Forzar reflujo para reiniciar la animación CSS
        void counterContainer.offsetWidth; 
        
        // Actualizar texto y animar
        counterText.innerText = `${currentScore}X 💙`;
        counterContainer.classList.add("counter-animate");

        // Limpiar el timeout anterior para que no se oculte antes de tiempo
        clearTimeout(counterTimeout);
        
        // Ocultar la clase animada cuando acabe (0.5s dura la animación CSS)
        counterTimeout = setTimeout(() => {
            counterContainer.classList.remove("counter-animate");
        }, 500);
    }

    // ==========================================
    // SISTEMA DE RECOMPENSAS / HITOS
    // ==========================================
    const milestones = [
        { points: 10,  id: "ms10", html: `<p class="reward-item text-xs text-rosegold-300 italic">❤️ Gracias por compartir nuestra felicidad.</p>` },
        { points: 25,  id: "ms25", html: `<p class="reward-item text-xs text-rosegold-300 italic">❤️ Cada latido nos acerca más a nuestro gran día.</p>` },
        { points: 50,  id: "ms50", html: `<p class="reward-item text-sm text-rosegold-400 font-serif">"El amor siempre encuentra el camino."</p>` },
        { points: 100, id: "ms100", html: `<div class="reward-item mt-3 inline-block px-4 py-2 border border-blue-400/30 bg-blue-900/20 rounded-full"><span class="text-xs font-bold text-blue-300 uppercase tracking-widest">💙 Maestro del Amor 💙</span></div>` }
    ];

    function checkMilestones(isInit = false) {
        let newContent = false;
        
        milestones.forEach(ms => {
            // Si pasamos el puntaje y no está renderizado en pantalla
            if (score >= ms.points && !document.getElementById(ms.id)) {
                const div = document.createElement("div");
                div.id = ms.id;
                div.innerHTML = ms.html;
                rewardsContainer.appendChild(div);
                
                // Pequeña vibración en el celular al desbloquear algo nuevo
                if (!isInit && navigator.vibrate) navigator.vibrate(50);
            }
        });
    }

    // Inicializar el módulo
    initGameObserver();
});