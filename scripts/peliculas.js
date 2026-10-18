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
        slide.classList.toggle("active", slideIndex === activeIndex);
    });

    filmThumbnails.forEach((thumbnail, thumbnailIndex) => {
        const isActive = thumbnailIndex === activeIndex;
        thumbnail.classList.toggle("active", isActive);
        thumbnail.setAttribute("aria-pressed", String(isActive));
    });

    if (filmCounter) filmCounter.textContent = String(activeIndex + 1).padStart(2, "0");
    filmThumbnails[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

nextButton?.addEventListener("click", () => setActiveSlide(activeIndex + 1));
previousButton?.addEventListener("click", () => setActiveSlide(activeIndex - 1));

filmThumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => setActiveSlide(index));
});

slider?.addEventListener("keydown", (event) => {
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












