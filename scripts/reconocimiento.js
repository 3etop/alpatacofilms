const awardGrid = document.querySelector(".award-grid");
const awardDialog = document.querySelector("[data-award-dialog]");
const awardPreview = document.querySelector("[data-award-preview]");
const awardCloseButton = document.querySelector("[data-award-close]");

if (awardGrid && awardDialog && awardPreview && awardCloseButton) {
    const awardTiles = [...awardGrid.children];

    awardTiles.forEach((tile, index) => {
        tile.setAttribute("role", "button");
        tile.setAttribute("tabindex", "0");
        tile.setAttribute("aria-label", `Ampliar laurel ${index + 1}`);
    });

    const openAward = (tile) => {
        const awardImage = tile.querySelector("img");
        if (!awardImage) return;
        awardPreview.src = awardImage.currentSrc || awardImage.src;
        awardPreview.alt = awardImage.alt;
        awardDialog.classList.toggle("award-dialog--light", tile.classList.contains("laureles-oscuros"));
        awardDialog.showModal();
    };

    awardGrid.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;
        const tile = event.target.closest(".award-grid > div");
        if (tile) openAward(tile);
    });

    awardGrid.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        if (!(event.target instanceof HTMLElement) || !event.target.matches(".award-grid > div")) return;
        event.preventDefault();
        openAward(event.target);
    });

    awardCloseButton.addEventListener("click", () => awardDialog.close());
    awardDialog.addEventListener("click", (event) => {
        if (event.target === awardDialog) awardDialog.close();
    });
    awardDialog.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            awardDialog.close();
        }
    });
    awardDialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        awardDialog.close();
    });
}









