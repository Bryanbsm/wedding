document.addEventListener("DOMContentLoaded", () => {
    
    const TIEMPO_PUNTAJE_EN_PANTALLA = 500; 
    const TIEMPO_LOGRO_XBOX = 4000; 
    const STORAGE_KEY = "bk_wedding_hearts";
    
    let score = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;
    let isGameRunning = false;
    let spawnInterval = null;

    // Hitos exactos (calculados basados en el puntaje actual)
    let nextRedThresholds = [10, 50].filter(t => score < t); 
    let nextHundredRed = Math.floor(score / 100) * 100 + 100; 
    let nextGolden = Math.floor(score / 50) * 50 + 50; // Se activa cada 50 puntos
    let nextAchievement = Math.floor(score / 100) * 100 + 100;
    
    const sideAlerts = [
        { pts: 10, msg: "❤️ Sigue así.", shown: score >= 10 },
        { pts: 25, msg: "❤️ Cada latido nos acerca más a nuestro gran día.", shown: score >= 25 }
    ];

    const triggerEl = document.getElementById("secret-trigger");
    const counterText = document.getElementById("minigame-score-text");
    const notifContainer = document.getElementById("minigame-notifications");
    const xboxContainer = document.getElementById("xbox-achievement");
    const xboxText = document.getElementById("xbox-achievement-text");
    
    const gameContainer = document.createElement("div");
    gameContainer.id = "minigame-container";
    document.body.appendChild(gameContainer);

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playPling() {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, audioCtx.currentTime); 
        osc.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    }

    function initGameObserver() {
        if (!triggerEl) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isGameRunning) {
                    setTimeout(() => startGame(), 1500);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(triggerEl);
    }

    function startGame() {
        if (isGameRunning) return;
        isGameRunning = true;
        // Intervalo más rápido (cada 400ms) para garantizar flujo constante
        spawnInterval = setInterval(() => createHeart(), 400);
    }

    function createHeart(forcedEmoji = null, forcedValue = null, fontSize = null) {
        // Límite subido a 30 para evitar cuellos de botella visuales
        if (gameContainer.childElementCount > 15) return; 

        const wrapper = document.createElement("div");
        const inner = document.createElement("div");
        wrapper.className = "heart-wrapper";
        inner.className = "heart-inner";

        if (forcedEmoji) {
            // Corazones especiales (Rojo o Dorado) por hitos
            inner.innerHTML = forcedEmoji;
            inner.style.fontSize = fontSize || "40px";
            wrapper.dataset.value = forcedValue;
            wrapper.style.animationDuration = "6s"; 
            wrapper.style.zIndex = "60"; 
        } else {
            // Corazones azules normales
            inner.innerHTML = "💙";
            const size = Math.random() * 20 + 15;
            inner.style.fontSize = `${size}px`;
            wrapper.dataset.value = 1;
            const fallDuration = (55 - size) / 3;
            wrapper.style.animationDuration = `${fallDuration}s`;
        }

        wrapper.style.left = `${Math.random() * 85}vw`;
        inner.style.animationDuration = `${Math.random() * 2 + 1.5}s`;

        wrapper.appendChild(inner);
        gameContainer.appendChild(wrapper);

        wrapper.addEventListener("pointerdown", handleHeartClick);
        wrapper.addEventListener("animationend", (e) => {
            if(e.animationName === "fall") wrapper.remove();
        });
    }

    function handleHeartClick(e) {
        const wrapper = e.currentTarget;
        if (wrapper.classList.contains("popped")) return; 

        playPling();
        wrapper.classList.add("popped");
        wrapper.querySelector('.heart-inner').innerHTML = "✨";

        score += parseInt(wrapper.dataset.value);
        localStorage.setItem(STORAGE_KEY, score);

        showFloatingCounter(score);
        checkMilestones();

        setTimeout(() => wrapper.remove(), 250);
    }

    let counterTimeout;
    function showFloatingCounter(currentScore) {
        counterText.innerText = `${currentScore}X 💙`;
        counterText.classList.add("counter-visible");
        clearTimeout(counterTimeout);
        counterTimeout = setTimeout(() => {
            counterText.classList.remove("counter-visible");
        }, TIEMPO_PUNTAJE_EN_PANTALLA);
    }

    function checkMilestones() {
        sideAlerts.forEach(alert => {
            if (score >= alert.pts && !alert.shown) {
                alert.shown = true;
                showSideNotification(alert.msg);
            }
        });

        // Corazón Dorado exacto cada 50
        if (score >= nextGolden) {
            nextGolden = Math.floor(score / 50) * 50 + 50; 
            createHeart("💛", 25, "35px");
        }

        // Corazón Rojo
        if (nextRedThresholds.length > 0 && score >= nextRedThresholds[0]) {
            nextRedThresholds.shift();
            createHeart("❤️", 50, "45px");
        }
        if (score >= nextHundredRed) {
            nextHundredRed = Math.floor(score / 100) * 100 + 100;
            createHeart("❤️", 50, "45px");
        }

        // Logro Xbox
        if (score >= nextAchievement) {
            nextAchievement = Math.floor(score / 100) * 100 + 100;
            showXboxAchievement("💙 Maestro del Amor 💙");
        }
    }

    function showSideNotification(text) {
        const notif = document.createElement("div");
        notif.className = "glass-card px-3 py-1.5 rounded-xl text-xs text-rosegold-300 notif-fade-in-out border border-rosegold-300/20";
        notif.innerText = text;
        notifContainer.appendChild(notif);
        if (navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => notif.remove(), 4000); 
    }

    let xboxTimeout;
    function showXboxAchievement(text) {
        xboxText.innerText = text;
        xboxContainer.classList.add("xbox-show");
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        clearTimeout(xboxTimeout);
        xboxTimeout = setTimeout(() => {
            xboxContainer.classList.remove("xbox-show");
        }, TIEMPO_LOGRO_XBOX);
    }

    initGameObserver();
});