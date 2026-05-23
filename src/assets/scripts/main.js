const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
});

function closeModal() {
    overlay.style.display = "none";
    document.body.style.overflow = "auto";
}

closeBtn.addEventListener("click", closeModal);

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});


const overlayCard = document.getElementById("overlayCard");
const openBtnCard = document.getElementById("openModalCard");
const closeBtnCard = document.getElementById("closeModalCard");

openBtnCard.addEventListener("click", () => {
    overlayCard.style.display = "flex";
    document.body.style.overflow = "hidden";
});

function closeModalCard() {
    overlayCard.style.display = "none";
    document.body.style.overflow = "auto";
}

closeBtnCard.addEventListener("click", closeModalCard);

overlayCard.addEventListener("click", (e) => {
    if (e.target === overlayCard) {
        closeModalCard();
    }
});

