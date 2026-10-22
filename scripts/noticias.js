const config = window.NOTICIAS_CONFIG || {};
const form = document.querySelector("[data-comment-form]");
const list = document.querySelector("[data-comment-list]");
const statusText = document.querySelector("[data-comment-status]");
const submitButton = document.querySelector("[data-comment-submit]");

const COOLDOWN_MS = 30000;
const COOLDOWN_KEY = "alpataco-comment-last";
const TOKENS_KEY = "alpataco-comment-tokens";
const isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
const endpoint = `${(config.supabaseUrl || "").replace(/\/$/, "")}/rest/v1/comentarios`;
const headers = {
    apikey: config.supabaseAnonKey || "",
    ...(String(config.supabaseAnonKey || "").startsWith("eyJ") ? { Authorization: `Bearer ${config.supabaseAnonKey}` } : {}),
    "Content-Type": "application/json"
};

function setStatus(message, state = "") {
    statusText.textContent = message;
    if (state) statusText.dataset.state = state;
    else delete statusText.dataset.state;
}

function renderMessage(text) {
    const item = document.createElement("li");
    item.className = "comment-empty";
    item.textContent = text;
    list.replaceChildren(item);
}

function readTokens() {
    try {
        return JSON.parse(localStorage.getItem(TOKENS_KEY)) || {};
    } catch {
        return {};
    }
}

async function deleteComment(id) {
    const tokens = readTokens();
    if (!tokens[id] || !window.confirm("¿Quieres eliminar tu comentario?")) return;

    try {
        const response = await fetch(`${endpoint.replace("/comentarios", "")}/rpc/borrar_comentario`, {
            method: "POST",
            headers,
            body: JSON.stringify({ p_id: id, p_token: tokens[id] })
        });
        if (!response.ok) throw new Error(String(response.status));

        delete tokens[id];
        localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        setStatus("Tu comentario fue eliminado.", "success");
        await loadComments();
    } catch {
        setStatus("No pudimos eliminar tu comentario. Inténtalo de nuevo.", "error");
    }
}

function closeMenus(except = null) {
    document.querySelectorAll(".comment-menu").forEach((menu) => {
        if (menu === except) return;
        menu.hidden = true;
        menu.previousElementSibling?.setAttribute("aria-expanded", "false");
    });
}

function createOptionsMenu(commentId) {
    const wrapper = document.createElement("div");
    wrapper.className = "comment-options";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "comment-options-button";
    toggle.setAttribute("aria-label", "Opciones del comentario");
    toggle.setAttribute("aria-haspopup", "menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="bi bi-three-dots-vertical" aria-hidden="true"></i>';

    const menu = document.createElement("div");
    menu.className = "comment-menu";
    menu.setAttribute("role", "menu");
    menu.hidden = true;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("role", "menuitem");
    remove.textContent = "Eliminar mensaje";
    remove.addEventListener("click", () => {
        closeMenus();
        deleteComment(commentId);
    });

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = menu.hidden;
        closeMenus(menu);
        menu.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) remove.focus();
    });

    menu.append(remove);
    wrapper.append(toggle, menu);
    return wrapper;
}

function createCommentItem(comment) {
    const item = document.createElement("li");
    item.className = "comment-item";

    const meta = document.createElement("p");
    meta.className = "comment-meta";

    const author = document.createElement("span");
    author.className = "comment-author";
    author.textContent = comment.nombre;

    const date = document.createElement("time");
    date.className = "comment-date";
    date.dateTime = comment.created_at;
    date.textContent = new Date(comment.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

    const text = document.createElement("p");
    text.className = "comment-text";
    text.textContent = comment.mensaje;

    meta.append(author, date);
    const body = document.createElement("div");
    body.className = "comment-body";
    body.append(meta, text);

    item.append(body);
    if (readTokens()[comment.id]) item.append(createOptionsMenu(comment.id));
    return item;
}

async function loadComments() {
    if (!isConfigured) {
        renderMessage("Los comentarios estarán disponibles muy pronto.");
        return;
    }

    try {
        const response = await fetch(`${endpoint}?select=id,nombre,mensaje,created_at&order=created_at.desc&limit=100`, { headers });
        if (!response.ok) throw new Error(String(response.status));
        const comments = await response.json();
        if (!comments.length) {
            renderMessage("Aún no hay comentarios. ¡Sé la primera persona en escribir!");
            return;
        }
        list.replaceChildren(...comments.map(createCommentItem));
    } catch {
        renderMessage("No pudimos cargar los comentarios. Inténtalo de nuevo más tarde.");
    }
}

async function submitComment(event) {
    event.preventDefault();
    const data = new FormData(form);

    if (data.get("sitio_web")) return;

    const nombre = String(data.get("nombre") || "").trim();
    const mensaje = String(data.get("mensaje") || "").trim();

    if (!isConfigured) {
        setStatus("Los comentarios aún no están habilitados.", "error");
        return;
    }

    if (!nombre || !mensaje) {
        setStatus("Escribe tu nombre y tu comentario.", "error");
        return;
    }

    const lastSent = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (Date.now() - lastSent < COOLDOWN_MS) {
        setStatus("Espera unos segundos antes de publicar otro comentario.", "error");
        return;
    }

    submitButton.disabled = true;
    setStatus("Publicando…");

    try {
        const token = crypto.randomUUID();
        const response = await fetch(`${endpoint}?select=id`, {
            method: "POST",
            headers: { ...headers, Prefer: "return=representation" },
            body: JSON.stringify({ nombre: nombre.slice(0, 60), mensaje: mensaje.slice(0, 800), token_borrado: token })
        });
        if (!response.ok) throw new Error(String(response.status));

        const [created] = await response.json();
        if (created?.id) {
            const tokens = readTokens();
            tokens[created.id] = token;
            localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
        }

        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        form.reset();
        setStatus("¡Gracias! Tu comentario quedó publicado.", "success");
        await loadComments();
    } catch {
        setStatus("No pudimos publicar tu comentario. Inténtalo de nuevo.", "error");
    } finally {
        submitButton.disabled = false;
    }
}

if (form && list && statusText && submitButton) {
    form.addEventListener("submit", submitComment);
    document.addEventListener("click", () => closeMenus());
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenus();
    });
    loadComments();
}
