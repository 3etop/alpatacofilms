const slider = document.querySelector(".slider");
const slides = [...document.querySelectorAll(".slider .list .item")];
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("prev");
const filmThumbnails = [...document.querySelectorAll(".thumbnail .item")];
const filmCounter = document.querySelector("[data-current-film]");
const modal = document.getElementById("modal");
const modalIframeContainer = document.getElementById("modal-iframe-container");
const closeModalButton = document.getElementById("close-modal");
let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
let lastModalTrigger = null;
let touchStartX = null;

function setActiveSlide(index) {
    if (!slides.length) return;
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.setAttribute("role", "group");
        slide.setAttribute("aria-roledescription", "diapositiva");
        slide.setAttribute("aria-label", `${slideIndex + 1} de ${slides.length}`);
    });

    filmThumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle("active", isActive);
        thumbnail.setAttribute("aria-pressed", String(isActive));
        if (isActive) thumbnail.setAttribute("aria-current", "true");
        else thumbnail.removeAttribute("aria-current");
    });

    if (filmCounter) filmCounter.textContent = String(activeIndex + 1).padStart(2, "0");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const activeThumbnail = filmThumbnails[activeIndex];
    const strip = activeThumbnail?.parentElement;
    if (strip) {
        const left = activeThumbnail.offsetLeft - (strip.clientWidth - activeThumbnail.offsetWidth) / 2;
        strip.scrollTo({ left, behavior: reduceMotion ? "auto" : "smooth" });
    }
}

setActiveSlide(activeIndex);

nextButton?.addEventListener("click", () => setActiveSlide(activeIndex + 1));
previousButton?.addEventListener("click", () => setActiveSlide(activeIndex - 1));

filmThumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => setActiveSlide(index));
});

document.addEventListener("keydown", (event) => {
    if (modal?.style.display === "flex" || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest("input, textarea, select, iframe")) return;
    if (event.key === "ArrowRight") setActiveSlide(activeIndex + 1);
    if (event.key === "ArrowLeft") setActiveSlide(activeIndex - 1);
});

slider?.addEventListener("touchstart", (event) => {
    if (event.target instanceof Element && event.target.closest(".thumbnail, .arrows, .video-play")) return;
    touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

slider?.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const swipeDistance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(swipeDistance) > 55) setActiveSlide(activeIndex + (swipeDistance < 0 ? 1 : -1));
    touchStartX = null;
}, { passive: true });

function closeFilmModal() {
    if (!modal || !modalIframeContainer) return;
    modal.style.display = "none";
    modalIframeContainer.replaceChildren();
    lastModalTrigger?.focus();
}

function openFilmModal(trigger) {
    const iframeContainer = document.getElementById(trigger.dataset.iframeId);
    const sourceIframe = iframeContainer?.querySelector("iframe");
    if (!sourceIframe || !modal || !modalIframeContainer) return;

    const iframe = sourceIframe.cloneNode(true);
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.src += `${iframe.src.includes("?") ? "&" : "?"}autoplay=1`;

    modalIframeContainer.replaceChildren(iframe);
    lastModalTrigger = trigger;
    modal.style.display = "flex";
    closeModalButton?.focus();
}

document.querySelectorAll(".trailer-play, .pelicula-play").forEach((trigger) => {
    trigger.addEventListener("click", () => openFilmModal(trigger));
});

closeModalButton?.addEventListener("click", closeFilmModal);
modal?.addEventListener("click", (event) => {
    if (event.target === modal) closeFilmModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.style.display === "flex") closeFilmModal();
});












