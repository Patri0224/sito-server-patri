const loginBtn = document.getElementById("loginBtn");
const privateZone = document.getElementById("privateZone");
const famiglia = document.getElementById("famiglia");
const loginModal = document.getElementById("loginModal");
const closeModal = document.getElementById("closeModal");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

loginBtn.addEventListener("click", () => {
    loginModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    loginModal.classList.add("hidden");
    loginError.textContent = "";
    //se password ==casa allora mostra private zone e famiglia
    if (document.getElementById("password").value === "casa") {
        famiglia.classList.remove("hidden");
    }
    if (document.getElementById("password").value === "privato") {
        privateZone.classList.remove("hidden");
    }

});