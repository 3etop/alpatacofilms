document.addEventListener("DOMContentLoaded", () => {
    const mapLink = document.getElementById("direccion-link");
    const mapModal = document.getElementById("map-modal");
    const mapOverlay = document.getElementById("map-overlay");
    const mapModalClose = document.getElementById("map-modal-close");

    if (mapLink && mapModal && mapOverlay && mapModalClose) {
        mapLink.addEventListener("click", (e) => {
            e.preventDefault();
            mapModal.style.display = "block";
            mapOverlay.style.display = "block";
        });

        mapModalClose.addEventListener("click", () => {
            mapModal.style.display = "none";
            mapOverlay.style.display = "none";
        });

        mapOverlay.addEventListener("click", () => {
            mapModal.style.display = "none";
            mapOverlay.style.display = "none";
        });
    }

    const contactForm = document.querySelector("[data-whatsapp-form]");

    contactForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const subject = String(formData.get("subject") || "").trim();
        const message = String(formData.get("message") || "").trim();
        const whatsappMessage = [
            "Hola, Alpataco Films. Quisiera recibir información sobre sus películas.",
            `Nombre: ${name}`,
            `Correo: ${email}`,
            subject ? `Asunto: ${subject}` : null,
            "Mensaje:",
            message
        ].filter((line) => line !== null).join("\n");
        const whatsappUrl = `https://wa.me/573012361911?text=${encodeURIComponent(whatsappMessage)}`;
        const whatsappWindow = window.open(whatsappUrl, "_blank");

        if (whatsappWindow) {
            whatsappWindow.opener = null;
        } else {
            window.location.assign(whatsappUrl);
        }
    });
});