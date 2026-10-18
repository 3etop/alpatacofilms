const menuButton = document.querySelector("[data-menu-toggle]");
const menuIcon = menuButton?.querySelector("[data-menu-icon]");
const siteNav = document.querySelector("[data-site-nav]");
const hero = document.querySelector("[data-hero]");
const heroVideo = document.querySelector("[data-hero-video]");
const heroAudio = document.querySelector("[data-hero-audio]");
const audioButton = document.querySelector("[data-audio-toggle]");

function closeMenu() {
    if (!menuButton || !siteNav || !menuIcon) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    menuIcon.className = "bi bi-list";
    siteNav.classList.remove("is-open");
}

if (menuButton && siteNav && menuIcon) {
    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
        menuIcon.className = `bi bi-${isOpen ? "list" : "x-lg"}`;
        siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });
}

if (heroVideo && hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.addEventListener("playing", () => hero.classList.add("is-playing"), { once: true });
    heroVideo.addEventListener("ended", () => hero.classList.remove("is-playing"));
    heroVideo.play().catch(() => hero.classList.remove("is-playing"));
}

if (heroAudio && audioButton) {
    const audioLabel = audioButton.querySelector("[data-audio-label]");
    const audioIcon = audioButton.querySelector("i");

    audioButton.addEventListener("click", async () => {
        if (heroAudio.paused) {
            try {
                await heroAudio.play();
                audioButton.setAttribute("aria-pressed", "true");
                audioLabel.textContent = "Silenciar sonido";
                audioIcon.className = "bi bi-volume-mute";
            } catch {
                audioLabel.textContent = "Audio no disponible";
            }
            return;
        }

        heroAudio.pause();
        heroAudio.currentTime = 0;
        audioButton.setAttribute("aria-pressed", "false");
        audioLabel.textContent = "Activar sonido";
        audioIcon.className = "bi bi-volume-up";
    });

    heroAudio.addEventListener("ended", () => {
        audioButton.setAttribute("aria-pressed", "false");
        audioLabel.textContent = "Repetir sonido";
        audioIcon.className = "bi bi-volume-up";
    });
}

const revealItems = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && revealItems.length) {
    document.documentElement.classList.add("has-reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealItems.forEach((item) => revealObserver.observe(item));
}








