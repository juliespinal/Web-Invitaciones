document.addEventListener("DOMContentLoaded", function () {

    // 1. INICIAR ANIMACIONES AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true, offset: 50 });
    }

    // 2. PANTALLA DE PRE-CARGA (WELCOME)
    const welcomeScreen = document.getElementById('welcome-screen');
    const enterBtn = document.getElementById('enter-button');


    // Deshabilitar scroll mientras está el welcome
    document.body.style.overflow = 'hidden';

    enterBtn.addEventListener('click', function () {
        // Ejecuta la animación de salida
        welcomeScreen.classList.add('slide-out');

        // Reactiva el scroll principal
        document.body.style.overflow = 'auto';

        // Destruye el nodo del DOM tras la animación (0.8s) para que no moleste
        setTimeout(() => {
            welcomeScreen.remove();
        }, 800);
    });

    // 3. CUENTA REGRESIVA
    // Modificar fecha aquí (Mes Día, Año Horas:Min:Seg)
    const targetDate = new Date("May 22, 2027 21:00:00").getTime();

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
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });


    // 5. LÓGICA DE GALERÍA POLAROID (SWIPE)
    const stack = document.getElementById('polaroid-stack');
    let cards = Array.from(stack.querySelectorAll('.polaroid'));

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let activeCard = null;

    function initCards() {
        cards.forEach((card, index) => {
            card.style.zIndex = index;
            card.classList.remove('fly-out-right', 'fly-out-left', 'dragging');

            // Rotaciones base de las 3 fotos
            if (index === 0) card.style.transform = "rotate(-5deg) translateX(-10px)";
            if (index === 1) card.style.transform = "rotate(3deg) translateX(10px)";
            if (index === 2) card.style.transform = "rotate(-2deg)";
        });
        bindEventsToTopCard();
    }

    function bindEventsToTopCard() {
        if (cards.length === 0) {
            setTimeout(() => {
                cards = Array.from(stack.querySelectorAll('.polaroid'));
                initCards();
            }, 800);
            return;
        }

        activeCard = cards[cards.length - 1];

        activeCard.addEventListener('touchstart', dragStart, { passive: true });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);

        activeCard.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
    }

    function dragStart(e) {
        if (e.target.tagName.toLowerCase() === 'img') e.preventDefault();
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        activeCard.classList.add('dragging');
    }

    function dragMove(e) {
        if (!isDragging) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        currentX = x - startX;
        const rotate = currentX * 0.1;
        activeCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        activeCard.classList.remove('dragging');

        const threshold = 100;

        if (Math.abs(currentX) > threshold) {
            if (currentX > 0) activeCard.classList.add('fly-out-right');
            else activeCard.classList.add('fly-out-left');

            activeCard.removeEventListener('touchstart', dragStart);
            activeCard.removeEventListener('mousedown', dragStart);

            cards.pop();
            bindEventsToTopCard();

        } else {
            activeCard.style.transform = "rotate(-2deg)";
        }
        currentX = 0;
    }

    initCards();

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
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz8Xefial5-GKQ4QFIe7LpSfnyxcUdY-wtinjJBvEHpgAiln854cJ_MDQGfkJI1u-BeAQ/exec';

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