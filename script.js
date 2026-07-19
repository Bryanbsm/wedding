// ============================================================
// Comportamiento interactivo de la invitación de boda
// Este archivo centraliza la lógica de animaciones, cuenta regresiva,
// formulario RSVP y apertura del sobre de bienvenida.
// ============================================================

// Inicializa los iconos de Lucide para que se dibujen en la página.
lucide.createIcons();

  // --- Lógica del Modo Día/Noche ---
        const themeToggleBtn = document.getElementById('theme-toggle');
        const htmlElement = document.documentElement;

        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            if (navigator.vibrate) navigator.vibrate(50); // Pequeña vibración al cambiar
        });

                // Resto de Scripts
        function lockScroll() {
            document.documentElement.classList.add('overflow-hidden');
            document.body.classList.add('overflow-hidden');
        }
        function unlockScroll() {
            document.documentElement.classList.remove('overflow-hidden');
            document.body.classList.remove('overflow-hidden');
        }

        window.addEventListener('DOMContentLoaded', () => {
            lockScroll(); 
            
            const preloader = document.getElementById('preloader');
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 12) + 6;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                    progressText.innerText = 'Invitación lista • 100%';
                    
                    setTimeout(() => {
                        preloader.classList.add('opacity-0');
                        setTimeout(() => preloader.remove(), 700);
                    }, 600);
                } else {
                    progressBar.style.width = `${progress}%`;
                    progressText.innerText = `Preparando invitación... ${progress}%`;
                }
            }, 120);
        });

        const canvas = document.getElementById('ambient-canvas');
        const ctx = canvas.getContext('2d');
        
        let sparks = [];
        let rsvpSparks = [];
        let petals = [];
        let showPetals = false;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class AmbientSparkle {
            constructor() {
                this.reset();
                this.y = Math.random() * canvas.height;
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 10;
                this.size = Math.random() * 1.5 + 0.4;
                this.speedY = -(Math.random() * 0.4 + 0.1);
                this.speedX = Math.random() * 0.3 - 0.15;
                this.opacity = Math.random() * 0.6 + 0.1;
                this.oscillationSpeed = Math.random() * 0.02 + 0.005;
                this.oscillationDistance = Math.random() * 0.5;
                this.angle = 0;
            }
            update() {
                this.y += this.speedY;
                this.angle += this.oscillationSpeed;
                this.x += this.speedX + Math.sin(this.angle) * this.oscillationDistance;
                if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                    this.reset();
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                ctx.shadowColor = '#D4AF37';
                ctx.shadowBlur = 4;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        class CelebrationSpark {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3.5 + 1.2;
                this.speedX = (Math.random() * 8 - 4);
                this.speedY = (Math.random() * -9 - 3);
                this.gravity = 0.18;
                this.color = ['#D4AF37', '#E2B2A6', '#C07262', '#AA820A'][Math.floor(Math.random() * 4)];
                this.opacity = 1;
                this.decay = Math.random() * 0.015 + 0.008;
            }
            update() {
                this.speedY += this.gravity;
                this.x += this.speedX;
                this.y += this.speedY;
                this.opacity -= this.decay;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(this.opacity, 0);
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1.0;
            }
        }

        class RosePetal {
            constructor() {
                this.reset();
                this.y = Math.random() * -canvas.height;
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                this.size = Math.random() * 10 + 6;
                this.speedY = Math.random() * 1.2 + 0.6;
                this.speedX = Math.random() * 0.8 - 0.4;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = Math.random() * 1.5 - 0.75;
                this.swingAngle = Math.random() * 360;
                this.swingSpeed = Math.random() * 0.02 + 0.01;
            }
            update() {
                this.y += this.speedY;
                this.swingAngle += this.swingSpeed;
                this.x += this.speedX + Math.sin(this.swingAngle) * 0.6;
                this.rotation += this.rotationSpeed;
                if (this.y > canvas.height + 20) {
                    this.reset();
                }
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size / 1.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#C07262';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 2;
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < 35; i++) { sparks.push(new AmbientSparkle()); }

        function triggerRsvpSparks() {
            const centerX = canvas.width / 2;
            const centerY = canvas.height * 0.7;
            for (let i = 0; i < 90; i++) {
                rsvpSparks.push(new CelebrationSpark(centerX, centerY));
            }
        }

        function triggerRosePetals() {
            if (showPetals) return;
            showPetals = true;
            for (let i = 0; i < 25; i++) {
                petals.push(new RosePetal());
            }
        }

        function runParticleLoop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            sparks.forEach(s => { s.update(); s.draw(); });
            rsvpSparks.forEach((s, index) => {
                s.update(); s.draw();
                if (s.opacity <= 0) rsvpSparks.splice(index, 1);
            });
            if (showPetals) {
                petals.forEach(p => { p.update(); p.draw(); });
            }
            requestAnimationFrame(runParticleLoop);
        }
        runParticleLoop();
/* -------------------------------------------------------------
   1. HERO FADE & SCALE ON SCROLL (Scroll-driven Animation)
------------------------------------------------------------- */
const hero = document.getElementById('hero');

window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollPos <= heroHeight) {
        // Calcula la opacidad y el escalado suave al avanzar en la página.
        const opacity = 1 - (scrollPos / heroHeight) * 1.6;
        const scale = 1 - (scrollPos / heroHeight) * 0.12;

        hero.style.opacity = Math.max(opacity, 0);
        hero.style.transform = `scale(${Math.max(scale, 0.88)})`;
    }
});

/* -------------------------------------------------------------
   2. WORD-BY-WORD SCROLL-REVEAL FOR "LA HISTORIA"
------------------------------------------------------------- */
const textContainer = document.getElementById('story-text');
const textContent = textContainer.innerText.trim();
textContainer.innerHTML = '';

// Divide el texto en palabras y las convierte en elementos span para
// animarlas de forma progresiva conforme se desplaza la pantalla.
const wordSpans = textContent.split(/\s+/).map(word => {
    const span = document.createElement('span');
    span.className = 'reveal-word transition-all duration-500 text-white/20 inline-block mr-1.5 transform translate-y-0';
    span.innerText = word;
    textContainer.appendChild(span);
    return span;
});

function handleWordReveal() {
    const rect = textContainer.getBoundingClientRect();
    const viewHeight = window.innerHeight;

    // Define los límites en los que la animación empieza y termina.
    const startTrigger = viewHeight * 0.85;
    const endTrigger = viewHeight * 0.20;

    // Calcula un progreso lineal para decidir cuántas palabras se iluminan.
    const progress = (startTrigger - rect.top) / (startTrigger - endTrigger);
    const clampedProgress = Math.min(Math.max(progress, 0), 1);

    const activeThreshold = Math.floor(clampedProgress * wordSpans.length);

    wordSpans.forEach((span, idx) => {
        if (idx < activeThreshold) {
            span.classList.remove('text-white/20');
            span.classList.add('text-rosegold-300');
            span.style.textShadow = '0 0 8px rgba(226, 178, 166, 0.25)';
        } else {
            span.classList.add('text-white/20');
            span.classList.remove('text-rosegold-300');
            span.style.textShadow = 'none';
        }
    });
}

window.addEventListener('scroll', handleWordReveal);
window.addEventListener('resize', handleWordReveal);
handleWordReveal();

/* -------------------------------------------------------------
   3. INTERSECTION OBSERVER FOR TRANSITIONS
------------------------------------------------------------- */
const revealElements = document.querySelectorAll('.reveal-element');
const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

revealElements.forEach(el => {
    el.classList.add('reveal-element');
    revealObserver.observe(el);
});

/* -------------------------------------------------------------
   4. COUNTDOWN TIMER CONFIGURATION (TARGET: NOV 14, 2026)
------------------------------------------------------------- */
const targetDate = new Date('Nov 14, 2026 16:00:00').getTime();
const daysUntilNumber = document.getElementById('days-until-number');

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        document.getElementById('countdown-container').innerHTML = `
            <div class="col-span-4 py-4 font-serif text-xl text-gold-light italic">
                ¡Llegó el gran día! Nos estamos uniendo en matrimonio.
            </div>
        `;
        if (daysUntilNumber) daysUntilNumber.innerText = '¡Hoy!';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = days.toString().padStart(2, '0');
    document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');

    if (daysUntilNumber) daysUntilNumber.innerText = days.toString().padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* -------------------------------------------------------------
   5. ALERTA DE CÓDIGO DE VESTIMENTA (SweetAlert2)
------------------------------------------------------------- */
function showDressCodeAlert() {
    Swal.fire({
        title: '<span class="font-serif text-2xl" style="color: #070B19;">Código de Vestimenta</span>',
        html: '<p style="color: #475569; font-size: 0.875rem; font-family: Montserrat, sans-serif;">Agradecemos tu comprensión al <b>no usar prendas de color azul o blanco</b>, ya que estos tonos están reservados exclusivamente para los trajes de los novios.</p>',
        icon: 'info',
        iconColor: '#D29082',
        confirmButtonText: '¡Entendido!',
        confirmButtonColor: '#C07262',
        background: '#FAF0EE',
        backdrop: 'rgba(7, 11, 25, 0.8)',
        customClass: {
            popup: 'rounded-2xl'
        }
    });
}

/* -------------------------------------------------------------
   4.1 CALENDARIO INTERACTIVO (Noviembre 2026, con el 14 resaltado)
------------------------------------------------------------- */
(function buildCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    const year = 2026;
    const month = 10; // Noviembre (0-indexado)
    const weddingDay = 14;
    const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    for (let i = 0; i < firstWeekday; i++) {
        html += '<span class="w-8 h-8"></span>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        if (d === weddingDay) {
            html += `
                <span class="relative w-8 h-8 flex items-center justify-center">
                    <span class="absolute inset-0 rounded-full border-2 border-gold/50 seal-pulse-ring"></span>
                    <span class="relative w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold text-navy-dark shadow-[0_0_14px_rgba(212,175,55,0.55)]" style="background: linear-gradient(135deg,#F5E6C8,#D4AF37);">
                        ${d}
                    </span>
                </span>`;
        } else {
            html += `
                <span class="w-8 h-8 flex items-center justify-center text-xs font-light text-slate-400/80">
                    ${d}
                </span>`;
        }
    }

    grid.innerHTML = html;
})();

/* -------------------------------------------------------------
   4.2 AGREGAR AL CALENDARIO DEL CELULAR (archivo .ics descargable)
------------------------------------------------------------- */
(function setupAddToCalendar() {
    const link = document.getElementById('add-to-calendar');
    if (!link) return;

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Bryan & Katherin//Boda//ES',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:boda-bryan-katherin-14112026@invitacion',
        'DTSTAMP:20260101T000000Z',
        'DTSTART:20261114T210000Z',
        'DTEND:20261115T020000Z',
        'SUMMARY:Boda de Bryan & Katherin',
        'DESCRIPTION:Ceremonia religiosa en la Parroquia La Inmaculada\\, Belalcázar\\, Caldas.',
        'LOCATION:Parroquia La Inmaculada\\, Belalcázar\\, Caldas',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    link.href = URL.createObjectURL(blob);
})();

/* -------------------------------------------------------------
   5. RSVP FORM HANDLING (URLs personalizadas, Toggles y Sheets)
------------------------------------------------------------- */
// 1. BASE DE DATOS DE FAMILIAS 
const familiasData = {
    "3201B": [
        "JACKELINE MEJIA MIRANDA",
        "BENITO GERMAN MARTINEZ"
    ],
    "1": [
        "YISET MARTINEZ",
        "ANGEL MANUEL",
        "VICTOR QUICENO"
    ],
    "6302B": [
        "YISET MARTINEZ",
        "ANGEL MANUEL",
        "VICTOR QUICENO"
    ],
    "9203B": [
        "MARIA MIRANDA",
        "PEDRO MEJIA"
    ],
    "12504B": [
        "BLANCA MEJIA",
        "DENIS",
        "BREINER",
        "HIJO DENIS",
        "ISABELLA"
    ],
    "15305B": [
        "FRANCIA MEJIA",
        "MAURICIO IBARRA",
        "SARAY VALENTINA"
    ],
    "18106B": [
        "LENIS MEJIA"
    ],
    "21107B": [
        "ELIAN BOTINA MEJIA"
    ],
    "24508B": [
        "XIOMARA BOTINA",
        "STEVEN MOLINA",
        "SALOME MOLINA",
        "SARA MOLINA",
        "SOFIA MOLINA"
    ],
    "27409B": [
        "JHONATAN MEJIA",
        "ESTEFANIA",
        "HIJO",
        "MARIA JOSE"
    ],
    "302010B": [
        "MARIA LIGIA ACOSTA",
        "FLORO MARTINEZ"
    ],
    "334011B": [
        "MARCELA MARTINEZ",
        "ANDRES JURADO",
        "JULIAN JURADO",
        "HILARY"
    ],
    "364012B": [
        "LEIDY MARTINEZ",
        "PABLO SOTELO",
        "ALEJANDRO SOTELO",
        "LAURA SOTELO"
    ],
    "395013B": [
        "JORGE MARTINEZ",
        "LINA VILLA",
        "SOFIA MARTINEZ",
        "SARA MARTINEZ",
        "BEBE"
    ],
    "421014B": [
        "ANDRES MARTINEZ"
    ],
    "452015B": [
        "JOHAN OROZCO",
        "ACOMPAÑANTE"
    ],
    "482016B": [
        "ROCIO DIAZ",
        "ESPOSO"
    ],
    "512017B": [
        "MONICA SANCHEZ",
        "ESPOSO"
    ],
    "543018K": [
        "GLORIA ARCILA",
        "FERNANDO MORALES",
        "EMMANUEL"
    ],
    "572019K": [
        "NANDO",
        "NAYENCI"
    ],
    "602020K": [
        "VALENTINA ARCILA",
        "JAVIER"
    ],
    "631021K": [
        "RICARDO ARCILA BALLESTEROS"
    ],
    "661022K": [
        "JUAN ARCILA"
    ],
    "691023K": [
        "PABLO ARCILA"
    ],
    "721024K": [
        "RICARDO ARCILA NOREÑA"
    ],
    "751025K": [
        "DAIRA MORA"
    ],
    "781026K": [
        "SAULO DE JESUS ARCILA NOREÑA"
    ],
    "814027K": [
        "FELIX ARCILA NOREÑA",
        "DEISY VELASQUEZ",
        "LEIDY",
        "MATHIAS"
    ],
    "843028K": [
        "SANDRA MILENA MORALES",
        "ANA MARIA BERMUDEZ M",
        "JUAN DAVID BERMUDEZ M"
    ],
    "871029K": [
        "GABRIEL BERMUDEZ"
    ],
    "902030K": [
        "CARMEN NOREÑA",
        "RICARDO ARCILA"
    ],
    "932031K": [
        "DANIEL MORALES A",
        "MARIA LUZ ACEVEDO"
    ],
    "961032K": [
        "VALENTINA DUQUE"
    ],
    "992033K": [
        "CAMILA ALVAREZ",
        "ESPOSO"
    ],
    "1023034K": [
        "SUSAN",
        "SANTIAGO",
        "AITANA"
    ],
    "1052035K": [
        "TATIANA",
        "VALENTIN"
    ],
    "1083036K": [
        "SANDRA GUARIN",
        "ALVARO",
        "MAILY"
    ],
    "1112037K": [
        "NAYIBI SALAZAR",
        "ESPOSO"
    ],
    "1142038K": [
        "YAZMIN BLANDON N",
        "ESPOSO"
    ],
    "1172039K": [
        "NORA",
        "KAREN"
    ],
    "1203040K": [
        "JOHANA",
        "SOFIA",
        "ESPOSO"
    ],
    "1232041K": [
        "CARLOS ZAPATA",
        "ESPOSA"
    ],
    "1261042K": [
        "ESTEBAN"
    ],
    "1292043": [
        "BRYAN",
        "KATHERIN"
    ]
};

// 2. EXTRAER CÓDIGO DE LA URL (?guest=CODIGO)
const urlParams = new URLSearchParams(window.location.search);
const guestCode = urlParams.get('guest');
const familyMembers = familiasData[guestCode];

const rsvpForm = document.getElementById('rsvp-form');
const invalidMsg = document.getElementById('invalid-code-msg');
const familyGreeting = document.getElementById('family-greeting-name');
const membersList = document.getElementById('members-list');
const familyContainer = document.getElementById('family-members-container');
const submitBtn = document.getElementById('submit-btn');
const successScreen = document.getElementById('success-screen');
const successIconWrap = document.getElementById('success-icon-wrap');
const successTitle = document.getElementById('success-title');
const successMessage = document.getElementById('success-message');
const editRsvpBtn = document.getElementById('edit-rsvp-btn');
const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
const transportToggle = document.getElementById('transport-toggle');

const RSVP_STORAGE_KEY = 'bk_wedding_rsvp_2026';

// 3. INICIALIZACIÓN DE LA INTERFAZ
// 3. INICIALIZACIÓN DE LA INTERFAZ
if (!familyMembers) {
    invalidMsg.classList.remove('hidden');
} else {
    rsvpForm.classList.remove('hidden');
    familyGreeting.textContent = "Familia " + familyMembers[0].split(" ")[0]; 
    
    membersList.innerHTML = '';
    familyMembers.forEach((member, index) => {
        // Nuevo diseño de Switch con SÍ/NO adentro (apagado por defecto)
        const toggleHtml = `
<div class="flex items-center justify-between p-3 rounded-xl bg-navy-dark/40 border border-rosegold-300/10 hover:bg-navy-dark/60 transition-colors">

    <!-- Nombre -->
    <span class="text-xs text-slate-200 uppercase flex-1 pr-3 break-words">
        ${member}
    </span>

    <!-- Switch -->
    <label class="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input type="checkbox" class="sr-only member-toggle" value="${member}">

        <div class="switch-track relative w-16 h-8 rounded-full bg-gray-400 transition-colors duration-300">

            <span class="switch-no absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-black">
                NO
            </span>

            <span class="switch-si absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-black">
                SI
            </span>

            <div class="switch-thumb absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300"></div>

        </div>
    </label>

</div>
        `;
        membersList.insertAdjacentHTML('beforeend', toggleHtml);
    });
}


// 4. LÓGICA DE OCULTAR/MOSTRAR LISTA SEGÚN SI ASISTEN O NO (Con animación)
attendanceRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'SI') {
            // Quitamos el hidden y luego animamos para que baje suavemente
            familyContainer.classList.remove('hidden');
            setTimeout(() => {
                familyContainer.classList.remove('opacity-0', '-translate-y-4', 'pointer-events-none');
                familyContainer.classList.add('opacity-100', 'translate-y-0');
            }, 10); // Pequeño retraso para que el navegador procese el display:block
        } else {
            // Animamos para que suba y desaparezca, luego aplicamos hidden
            familyContainer.classList.remove('opacity-100', 'translate-y-0');
            familyContainer.classList.add('opacity-0', '-translate-y-4', 'pointer-events-none');
            setTimeout(() => {
                familyContainer.classList.add('hidden');
            }, 300); // Esperamos a que termine la transición (300ms)
        }
    });
});


// 5. RENDERIZAR PANTALLA DE ÉXITO
function renderSuccess(attendance) {
    if (attendance === 'NO') {
        successIconWrap.className = 'w-16 h-16 rounded-full bg-rosegold-400/10 border border-rosegold-300/30 flex items-center justify-center text-rosegold-300 animate-scale-up';
        successIconWrap.innerHTML = '<i data-lucide="heart-handshake" class="w-9 h-9"></i>';
        successTitle.textContent = 'Gracias por avisarnos';
        successMessage.textContent = 'Nos hubiera encantado contar con su presencia, pero entendemos y los llevaremos en el corazón ese día.';
    } else {
        successIconWrap.className = 'w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-scale-up';
        successIconWrap.innerHTML = '<i data-lucide="check-circle-2" class="w-10 h-10"></i>';
        successTitle.textContent = '¡Confirmación Recibida!';
        successMessage.textContent = 'Su respuesta ha sido registrada exitosamente. ¡Nos vemos en la boda!';
    }
    lucide.createIcons();
    rsvpForm.classList.add('hidden');
    successScreen.classList.remove('hidden');
    successScreen.classList.add('animate-fade-in');
}

// Revisar si ya habían confirmado en este celular
const savedRSVP = localStorage.getItem(RSVP_STORAGE_KEY);
if (savedRSVP && familyMembers) {
    try { renderSuccess(JSON.parse(savedRSVP).asiste); } catch (e) {}
}

// 6. ENVÍO DE DATOS A SPREADSHEET
rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const asisteGeneral = document.querySelector('input[name="attendance"]:checked').value;
    const guestMessage = document.getElementById('guest-message').value.trim();
    
    let asistentesNombres = "";
    let cantidadAsistentes = 0;

    if (asisteGeneral === 'SI') {
        // Recorrer qué switches están encendidos
        const toggles = document.querySelectorAll('.member-toggle:checked');
        toggles.forEach(toggle => {
            asistentesNombres += `-${toggle.value}\n`; // Salto de línea por cada uno
            cantidadAsistentes++;
        });
        asistentesNombres = asistentesNombres.trim(); // Quitar último salto
        
        if(cantidadAsistentes === 0) {
            alert("Si indican que asistirán, debes seleccionar al menos a un miembro de la familia.");
            return;
        }
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    // CAMBIA ESTA URL por tu nueva URL del Web App de Apps Script
    const urlAppScript = 'https://script.google.com/macros/s/AKfycbw-sDHp-YZ3O5d0XvnTAnLUCvdNvehv86bbdUyDGz1es7P_EEs5Tz9XAcoE11E0FmpgZg/exec';
    
    const payload = {
        code: guestCode,
        nombre: familyMembers[0], // Siempre enviamos el líder familiar
        asiste: asisteGeneral,
        cant: cantidadAsistentes,
        asistentes: asistentesNombres,
        transporte: transportToggle ? (transportToggle.checked ? "SI" : "NO") : "NO",
        mensaje: guestMessage
    };

    fetch(urlAppScript, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(payload));
            renderSuccess(asisteGeneral);
            if (asisteGeneral === 'SI') createConfetti();
        }
    })
    .catch(error => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Confirmar Asistencia';
        alert('Hubo un error al registrar. Intenta de nuevo.');
    });
});

editRsvpBtn.addEventListener('click', function () {
    localStorage.removeItem(RSVP_STORAGE_KEY);
    successScreen.classList.add('hidden');
    rsvpForm.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Confirmar Asistencia';
});

function createConfetti() {
    // ... tu código de confeti original se mantiene intacto aquí
    const colors = ['#E2B2A6', '#FAF0EE', '#D4AF37', '#885F30'];
    for (let i = 0; i < 35; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        const size = Math.random() * 8 + 4;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        const fallDuration = 7 - (size / 2.5);
        confetti.style.animationDuration = fallDuration + 's';
        confetti.style.animationDelay = (Math.random() * -7) + 's';
        successScreen.appendChild(confetti);
    }
}
/* -------------------------------------------------------------
   6. SOBRE DE BIENVENIDA (abrir con el primer scroll/tap,
      y "guardar" la carta de nuevo al volver arriba)
------------------------------------------------------------- */
const envelopeGate = document.getElementById('envelope-gate');
const envelopeScene = document.getElementById('envelope-scene');
const envelopeFlap = document.getElementById('envelope-flap');
const waxSeal = document.getElementById('wax-seal');
const letterCard = document.getElementById('letter-card');

let envelopeIsOpen = false;
let envelopeAnimating = false;
let hasScrolledAway = false;

function lockScroll() {
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden');
}

function unlockScroll() {
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden');
}

function resetContentAnimations() {
    // Reincia las tarjetas y textos para que vuelvan a entrar en escena.
    document.querySelectorAll('.reveal-element').forEach((el) => {
        el.classList.remove('active');
        revealObserver.observe(el);
    });

    hero.style.opacity = '';
    hero.style.transform = '';
    handleWordReveal();
}

function openEnvelope() {
    if (envelopeIsOpen || envelopeAnimating) return;
    envelopeAnimating = true;
    envelopeScene.classList.add('is-opening');

    if (navigator.vibrate) navigator.vibrate([12, 40, 20]);

    waxSeal.classList.add('is-open');

    setTimeout(() => envelopeFlap.classList.add('is-open'), 150);
    setTimeout(() => letterCard.classList.add('is-open'), 550);
    setTimeout(() => envelopeGate.classList.add('is-hidden'), 1300);

    setTimeout(() => {
        envelopeGate.style.display = 'none';
        unlockScroll();
        envelopeIsOpen = true;
        envelopeAnimating = false;
        hasScrolledAway = false;
    }, 2000);
}

function closeEnvelope() {
    if (envelopeAnimating) return;
    envelopeAnimating = true;

    window.scrollTo(0, 0);
    resetContentAnimations();

    envelopeGate.style.display = 'flex';
    void envelopeGate.offsetWidth;
    envelopeGate.classList.remove('is-hidden');
    envelopeFlap.classList.remove('is-open');
    waxSeal.classList.remove('is-open');
    letterCard.classList.remove('is-open');
    envelopeScene.classList.remove('is-opening');

    lockScroll();
    envelopeIsOpen = false;
    hasScrolledAway = false;

    setTimeout(() => {
        envelopeAnimating = false;
    }, 800);
}

// Feedback táctil al presionar el sobre.
envelopeScene.addEventListener('pointerdown', () => envelopeScene.classList.add('is-pressed'));
['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
    envelopeScene.addEventListener(evt, () => envelopeScene.classList.remove('is-pressed'));
});

envelopeGate.addEventListener('click', openEnvelope);
envelopeGate.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) openEnvelope();
}, { passive: true });

let touchStartY = 0;
envelopeGate.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });
envelopeGate.addEventListener('touchmove', (e) => {
    if (touchStartY - e.touches[0].clientY > 12) openEnvelope();
}, { passive: true });

// Si el usuario baja por toda la invitación y luego regresa arriba,
// la carta vuelve a guardar su estado dentro del sobre.
window.addEventListener('scroll', () => {
    if (!envelopeIsOpen) return;
    if (window.scrollY > 80) hasScrolledAway = true;
    if (window.scrollY <= 2 && hasScrolledAway) {
        closeEnvelope();
    }
});

