const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLink = document.querySelectorAll(".nav-link");
const mainContent = document.querySelector("main");
var isMenuOpen = false;

chargeContent("nav-inicio");

hamburger.addEventListener("click", openMenu);

document.querySelectorAll(".footer-navbar-item a").forEach(e => {
    e.addEventListener("click", () => { chargeContent(e.id) });
});

navLink.forEach(n => {
    n.addEventListener("click", () => {
        changeStyle(n);
        closeMenu();
        chargeContent(n.id);
    })
});

window.addEventListener('scroll', function () {
    if (isMenuOpen) {
        closeMenu();
    }
});

function openMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    isMenuOpen = true;
}

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    isMenuOpen = false;
}

function changeStyle(element) {
    navLink.forEach(e => {
        e.classList.remove("nav-link-active");
    });
    element.classList.add("nav-link-active");
}

function chargeContent(contentId) {
    let urlContent = '';
    let scriptPath;
    switch (contentId) {
        case "nav-inicio":
        case "ftr-inicio":
            urlContent = "../partial/inicio.html"
            break;
        case "nav-gestion":
        case "ftr-gestion":
            urlContent = "../partial/gestion.html"
            scriptPath = './js/gestion.js'
            break;
        case "nav-galeria":
        case "ftr-galeria":
            urlContent = "../partial/galeria.html"
            break;
        case "nav-contacto":
        case "ftr-contacto":
            urlContent = "../partial/contacto.html"
            scriptPath = './js/contacto.js'
            break;
    }

    fetch(urlContent)
        .then(resp => {
            if (resp.ok) {
                return resp.text();
            } else {
                throw ("Error");
            }
        })
        .then(html => {
            mainContent.innerHTML = html;
            document.querySelectorAll('script').forEach(e => {
                if (e.src && e.id !== 'main-js') {
                    e.remove();
                }
            });
            if (scriptPath) {
                createElementScript(scriptPath);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
            console.error(error);
            mainContent.innerHTML = '<div class="content-error">Error cargando contenido</div>';
        });
}

function createElementScript(path) {
    let script = document.createElement('script');
    script.type = "text/javascript"
    script.src = path;
    document.querySelector("body").appendChild(script);
}
