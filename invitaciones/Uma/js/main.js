document.addEventListener("DOMContentLoaded", function () {

    // 1. INICIAR ANIMACIONES AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true, offset: 50 });
    }

    // 2. PANTALLA DE PRE-CARGA (WELCOME)
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-button');
    const bgMusic = document.getElementById('bg-music');

    const musicBtn = document.getElementById('musicButton');
    const musicImage = document.getElementById('musicImage');

    // Bloquear scroll al inicio
    document.body.style.overflow = 'hidden';

    // Estado inicial
    let musicStarted = false;

    // BOTÓN MUTE / UNMUTE
    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', function () {

            // Si todavía no empezó, no hacer nada
            if (!musicStarted) return;

            // Toggle mute
            bgMusic.muted = !bgMusic.muted;

            // Cambiar imagen
            if (bgMusic.muted) {
                musicImage.src =
                    'https://evnt.ar/assets/images/pause.png';
            } else {
                musicImage.src =
                    'https://evnt.ar/assets/images/play.gif';
            }
        });
    }

    // BOTÓN INGRESAR
    if (enterBtn && welcomeScreen) {
        enterBtn.addEventListener('click', async function () {

            // Iniciar música
            if (bgMusic) {
                try {
                    bgMusic.volume = 0.35;
                    bgMusic.loop = true;
                    bgMusic.muted = false;

                    await bgMusic.play();

                    musicStarted = true;

                } catch (error) {
                    console.error(
                        'Error reproduciendo audio:',
                        error
                    );
                }
            }

            // Animación salida welcome
            welcomeScreen.classList.add('slide-out');

            // Reactivar scroll
            document.body.style.overflow = 'auto';

            // Mostrar botón de música
            if (musicBtn) {
                setTimeout(() => {
                    musicBtn.classList.add('visible');
                }, 500);
            }

            // Remover welcome
            setTimeout(() => {
                welcomeScreen.remove();
            }, 800);
        });
    }
    // 3. CUENTA REGRESIVA
    // Modificar fecha aquí (Mes Día, Año Horas:Min:Seg)
    const targetDate = new Date(2026, 7, 9, 19, 0, 0).getTime();

    const countdownInterval = setInterval(function () {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown").innerHTML = "<h3 class='title-light'>¡LLEGÓ EL DÍA!</h3>";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("cd-days").innerText = days < 10 ? "0" + days : days;
        document.getElementById("cd-hours").innerText = hours < 10 ? "0" + hours : hours;
        document.getElementById("cd-minutes").innerText = minutes < 10 ? "0" + minutes : minutes;
        document.getElementById("cd-seconds").innerText = seconds < 10 ? "0" + seconds : seconds;
    }, 1000);


    // 4. LÓGICA DE MODALES (Mapa y Regalos)
    const modalTriggers = document.querySelectorAll('.open-modal');
    const closeBtns = document.querySelectorAll('.modal__close');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            document.getElementById(modalId).classList.add('active');
            document.body.style.overflow = 'hidden'; // BLOQUEA SCROLL DEL FONDO
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
            document.body.style.overflow = 'auto'; // REACTIVA SCROLL
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto'; // REACTIVA SCROLL
        }
    });


    // ==========================================
    // 5. LÓGICA DE GALERÍA POLAROID (NUEVA VERSIÓN BLINDADA)
    // ==========================================
    const stack = document.getElementById('polaroid-stack');
    const cards = Array.from(stack.querySelectorAll('.polaroid'));
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let activeCard = null;
    let swipeCount = 0;

    function initCards(mezclar = false) {
        if (mezclar) {
            // Mezclamos aleatoriamente y volvemos a inyectar en el HTML
            cards.sort(() => Math.random() - 0.5);
            cards.forEach(card => stack.appendChild(card));
        }

        // Recalculamos basándonos en el orden real que tienen en el HTML
        const currentCards = stack.querySelectorAll('.polaroid');
        currentCards.forEach((card, index) => {
            card.style.zIndex = index;
            card.classList.remove('fly-out-right', 'fly-out-left', 'hide-polaroid', 'dragging');
            card.style.transform = '';

            const randomRot = Math.floor(Math.random() * 14) - 7;
            const randomX = Math.floor(Math.random() * 20) - 10;

            // Efecto cascada al reacomodarse
            setTimeout(() => {
                card.style.transform = `translateX(${randomX}px) rotate(${randomRot}deg)`;
            }, index * 100);
        });
    }

    // Le pegamos los eventos de inicio SOLO a las tarjetas, una sola vez
    cards.forEach(card => {
        card.addEventListener('touchstart', dragStart, { passive: true });
        card.addEventListener('mousedown', dragStart);
    });

    // Los eventos de movimiento y soltar van al documento general
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        // La magia acá: SOLO permitimos mover la tarjeta que está visualmente arriba (la última del HTML)
        if (e.currentTarget !== stack.lastElementChild) return;
        if (e.target.tagName.toLowerCase() === 'img') e.preventDefault();

        activeCard = e.currentTarget;
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        activeCard.classList.add('dragging');
    }

    function dragMove(e) {
        if (!isDragging || !activeCard) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        currentX = x - startX;
        const rotate = currentX * 0.1;
        activeCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
    }

    function dragEnd(e) {
        if (!isDragging || !activeCard) return;
        isDragging = false;
        activeCard.classList.remove('dragging');

        const threshold = 100; // Si movés la foto más de 100px, se va

        if (Math.abs(currentX) > threshold) {
            if (currentX > 0) activeCard.classList.add('fly-out-right');
            else activeCard.classList.add('fly-out-left');

            const cardOut = activeCard;
            setTimeout(() => {
                cardOut.classList.add('hide-polaroid');
                stack.prepend(cardOut); // Manda la tarjeta descartada al fondo de la pila del HTML

                swipeCount++;

                // Reacomodamos el z-index de las que quedan
                const currentCards = stack.querySelectorAll('.polaroid');
                currentCards.forEach((c, i) => c.style.zIndex = i);

                // Si ya tiramos todas, reseteamos el contador y las hacemos volver
                if (swipeCount >= cards.length) {
                    swipeCount = 0;
                    setTimeout(() => initCards(true), 500); // Medio segundo de suspenso y vuelven
                }
            }, 400); // 400ms es lo que tarda la animación de CSS en sacarla de pantalla

        } else {
            // Si la soltó antes del umbral, vuelve a una posición random
            const randomRot = Math.floor(Math.random() * 10) - 5;
            activeCard.style.transform = `rotate(${randomRot}deg)`;
        }

        activeCard = null;
        currentX = 0;
    }

    initCards(false);
    // ==========================================
    // 6. LÓGICA DEL FORMULARIO Y GOOGLE SHEETS
    // ==========================================

    const radioAsisteSi = document.getElementById('asiste-si');
    const radioAsisteNo = document.getElementById('asiste-no');
    const grupoAcompanado = document.getElementById('grupo-acompanado');
    const grupoAlimentacion = document.getElementById('grupo-alimentacion');

    const radioAcompanadoSi = document.getElementById('acompanado-si');
    const radioAcompanadoNo = document.getElementById('acompanado-no');
    const grupoAcompanantes = document.getElementById('grupo-acompanantes');
    const inputAcompanantes = document.getElementById('acompanante');

    // Función 1: Controlar si viene acompañado o no
    function toggleAcompanantes() {
        if (radioAcompanadoSi.checked) {
            grupoAcompanantes.classList.remove('hidden');
            inputAcompanantes.setAttribute('required', 'true');
        } else {
            grupoAcompanantes.classList.add('hidden');
            inputAcompanantes.removeAttribute('required');
            inputAcompanantes.value = '';
        }
    }

    // Función 2: Controlar si asiste o no asiste
    function toggleAsistencia() {
        if (radioAsisteNo.checked) {
            // Ocultar todo
            if (grupoAcompanado) grupoAcompanado.classList.add('hidden');
            if (grupoAcompanantes) grupoAcompanantes.classList.add('hidden');
            if (grupoAlimentacion) grupoAlimentacion.classList.add('hidden');

            // Quitar los required
            if (radioAcompanadoSi) radioAcompanadoSi.removeAttribute('required');
            if (inputAcompanantes) inputAcompanantes.removeAttribute('required');

            // Limpiar datos
            if (radioAcompanadoSi) radioAcompanadoSi.checked = false;
            if (radioAcompanadoNo) radioAcompanadoNo.checked = false;
            if (inputAcompanantes) inputAcompanantes.value = '';
            if (document.getElementById('alimento')) document.getElementById('alimento').value = 'Ninguna';

        } else {
            // Mostrar los grupos base
            if (grupoAcompanado) grupoAcompanado.classList.remove('hidden');
            if (grupoAlimentacion) grupoAlimentacion.classList.remove('hidden');

            // Volver a requerir si viene acompañado
            if (radioAcompanadoSi) radioAcompanadoSi.setAttribute('required', 'true');

            toggleAcompanantes();
        }
    }

    // Escuchadores
    if (radioAsisteSi && radioAsisteNo) {
        radioAsisteSi.addEventListener('change', toggleAsistencia);
        radioAsisteNo.addEventListener('change', toggleAsistencia);
    }

    if (radioAcompanadoSi && radioAcompanadoNo) {
        radioAcompanadoSi.addEventListener('change', toggleAcompanantes);
        radioAcompanadoNo.addEventListener('change', toggleAcompanantes);
    }

    // B. Envío de datos a Google Apps Script
    const rsvpForm = document.getElementById('rsvp-form');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbx47HzGEsN1f-DbMycItV6Nf0PtZ3T6iFEoO9rxrQPgZDeXq9nr_Gh_E4aMUNKDDTN31g/exec';

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = rsvpForm.querySelector('.btn-submit');
            const originalText = btn.innerText;
            btn.innerText = "ENVIANDO...";
            btn.disabled = true;

            fetch(scriptURL, { method: 'POST', body: new FormData(rsvpForm) })
                .then(response => {
                    alert("¡Gracias por confirmar! Tu respuesta fue enviada exitosamente.");
                    rsvpForm.reset();
                    if (grupoAcompanantes) grupoAcompanantes.classList.add('hidden');
                    btn.innerText = originalText;
                    btn.disabled = false;
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert("Hubo un problema al enviar la confirmación. Por favor, intentá nuevamente.");
                    btn.innerText = originalText;
                    btn.disabled = false;
                });
        });
    };
});
