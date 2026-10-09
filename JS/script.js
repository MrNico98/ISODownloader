import { isoData } from "./data.js";
import { isSha256, safeExternalUrl } from "./security.js";

const versionNames = {
    FormServer: "Windows Server",
    FormWin11: "Windows 11",
    FormWin10: "Windows 10",
    FormWin8: "Windows 8",
    FormWin7: "Windows 7",
    FormSpecial: "Strumenti Speciali"
};

const architectureNames = { x64: "64-bit", x32: "32-bit", Arm64: "ARM 64-bit" };
const specialLinks = [
    { name: "WinHubX Live", description: "Ambiente live per ripristino e manutenzione", url: "https://devuploads.com/ucpfdcbe6bl3", icon: "fas fa-desktop" },
    { name: "DaRT WinHubX", description: "Diagnostic and Recovery Toolset", url: "https://devuploads.com/ucpfdcbe6bl3", icon: "fas fa-tools" },
    { name: "Driver RST", description: "Intel Rapid Storage Technology Drivers", url: "https://github.com/MrNico98/WinHubX-Resource/releases/download/WinHubX-Risorse/DriverRST.zip", icon: "fas fa-microchip" }
];

function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function detail(label, value, valueClass = "") {
    const row = element("div", "iso-detail");
    row.append(element("span", "detail-label", `${label}:`), element("span", `detail-value ${valueClass}`.trim(), value));
    return row;
}

function createDownloadLink(url) {
    const safeUrl = safeExternalUrl(url);
    if (!safeUrl) return element("span", "btn btn-primary", "Download non disponibile");
    const link = element("a", "btn btn-primary");
    link.href = safeUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append(element("i", "fas fa-download"), document.createTextNode(" Scarica"));
    return link;
}

function createSpecialCard(item) {
    const card = element("article", "iso-card");
    Object.assign(card.dataset, { version: "special", language: "all", edition: "special", name: item.name.toLowerCase() });
    const header = element("div", "iso-header");
    const icon = element("div", "iso-icon");
    icon.append(element("i", item.icon));
    header.append(icon, element("div", "iso-title", item.name));
    const details = element("div", "iso-details");
    details.append(detail("Tipo", "Strumento speciale"), detail("Descrizione", item.description));
    const actions = element("div", "iso-actions");
    actions.append(createDownloadLink(item.url));
    card.append(header, details, actions);
    return card;
}

function createIsoCard(formKey, language, key, item) {
    const versionName = versionNames[formKey] ?? formKey;
    const displayName = `${versionName}${item.versione ? ` ${item.versione}` : ""}`;
    const versionId = formKey === "FormServer" ? "server" : formKey.toLowerCase().replace("formwin", "win");
    const architecture = ["Arm64", "x64", "x32", "x86"].find((candidate) => key.toLowerCase().includes(candidate.toLowerCase()));
    const normalizedArchitecture = architecture === "x86" ? "x32" : architecture;
    const editionText = (item.versione ?? "").toLowerCase();
    const edition = ["ltsc", "lite", "consumer", "pro", "enterprise", "ultimate", "stock"].find((name) => editionText.includes(name)) ?? "";

    const card = element("article", "iso-card");
    Object.assign(card.dataset, { version: versionId, language, edition, name: displayName.toLowerCase() });
    const header = element("div", "iso-header");
    const icon = element("div", "iso-icon");
    icon.append(element("i", formKey === "FormServer" ? "fas fa-server" : "fab fa-windows"));
    const title = element("div", "iso-title", displayName);
    if (normalizedArchitecture) title.append(document.createTextNode(" "), element("span", "architecture-badge", architectureNames[normalizedArchitecture]));
    header.append(icon, title);

    const details = element("div", "iso-details");
    details.append(
        detail("Lingua", language === "IT" ? "Italiano" : "Inglese"),
        detail("Versione", item.versione || "Standard"),
        detail("SHA256", item.sha256 || "Non disponibile", "sha-value")
    );
    const actions = element("div", "iso-actions");
    actions.append(createDownloadLink(item.link));
    if (isSha256(item.sha256)) {
        const copy = element("button", "btn btn-outline copy-sha");
        copy.type = "button";
        copy.append(element("i", "fas fa-copy"), document.createTextNode(" Copia SHA"));
        copy.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(item.sha256);
                copy.replaceChildren(element("i", "fas fa-check"), document.createTextNode(" Copiato!"));
                copy.classList.add("btn-success");
                setTimeout(() => {
                    copy.replaceChildren(element("i", "fas fa-copy"), document.createTextNode(" Copia SHA"));
                    copy.classList.remove("btn-success");
                }, 2000);
            } catch {
                copy.textContent = "Copia non disponibile";
            }
        });
        actions.append(copy);
    }
    card.append(header, details, actions);
    return card;
}

function matchesEdition(filter, item) {
    if (filter === "all") return true;
    const value = (item.versione ?? "").toLowerCase();
    if (filter === "standard") return value.includes("consumer") || value.includes("stock");
    return value.includes(filter.toLowerCase());
}

function renderCards() {
    const container = document.getElementById("iso-container");
    const version = document.getElementById("version-filter").value;
    const language = document.getElementById("language-filter").value;
    const edition = document.getElementById("edition-filter").value;
    const search = document.getElementById("search").value.trim().toLocaleLowerCase();
    const cards = [];

    if ((version === "all" || version === "special") && language === "all" && (edition === "all" || edition === "special")) {
        for (const item of specialLinks) if (!search || item.name.toLocaleLowerCase().includes(search)) cards.push(createSpecialCard(item));
    }

    for (const [formKey, languages] of Object.entries(isoData)) {
        if (formKey === "FormSpecial") continue;
        const versionId = formKey === "FormServer" ? "server" : formKey.toLowerCase().replace("formwin", "win");
        if (version !== "all" && version !== versionId) continue;
        for (const [languageCode, entries] of Object.entries(languages)) {
            if (language !== "all" && language !== languageCode) continue;
            for (const [key, item] of Object.entries(entries)) {
                const name = `${versionNames[formKey] ?? formKey}${item.versione ? ` ${item.versione}` : ""}`;
                if (search && !name.toLocaleLowerCase().includes(search)) continue;
                if (!matchesEdition(edition, item)) continue;
                cards.push(createIsoCard(formKey, languageCode, key, item));
            }
        }
    }

    container.replaceChildren(...(cards.length ? cards : [element("div", "no-results", "Nessun risultato trovato con i filtri applicati.")]));
    document.getElementById("loading").classList.add("hidden");
}

async function calculateSHA256(file) {
    const hasher = await hashwasm.createSHA256();
    hasher.init();
    const chunkSize = 16 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let offset = 0;
    let chunkIndex = 0;
    while (offset < file.size) {
        const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
        hasher.update(new Uint8Array(chunk));
        offset += chunk.byteLength;
        chunkIndex++;
        document.getElementById("verification-result").textContent = `Calcolo SHA256 in corso... ${Math.round((chunkIndex / totalChunks) * 100)}% (${chunkIndex}/${totalChunks} chunk)`;
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return hasher.digest("hex");
}

async function verifySHA256() {
    const file = document.getElementById("file-input").files[0];
    const expected = document.getElementById("sha-input").value.trim().toLowerCase();
    const result = document.getElementById("verification-result");
    const button = document.getElementById("verify-btn");
    if (!file) {
        result.textContent = "Seleziona un file ISO da verificare.";
        result.className = "verification-result error";
        return;
    }
    if (!isSha256(expected)) {
        result.textContent = "Inserisci un hash SHA256 valido (64 caratteri esadecimali).";
        result.className = "verification-result error";
        return;
    }

    button.disabled = true;
    button.textContent = "Calcolo in corso...";
    result.textContent = "Calcolo SHA256 in corso... 0%";
    result.className = "verification-result";
    try {
        const calculated = await calculateSHA256(file);
        result.textContent = calculated === expected
            ? "Verifica completata: gli hash corrispondono!"
            : `Verifica fallita: gli hash non corrispondono. Calcolato: ${calculated} — Atteso: ${expected}`;
        result.className = `verification-result ${calculated === expected ? "success" : "error"}`;
    } catch {
        result.textContent = "Impossibile calcolare l'hash del file selezionato.";
        result.className = "verification-result error";
    } finally {
        button.disabled = false;
        button.textContent = "Verifica SHA256";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCards();
    for (const id of ["version-filter", "language-filter", "edition-filter"]) document.getElementById(id).addEventListener("change", renderCards);
    document.getElementById("search").addEventListener("input", renderCards);
    document.getElementById("verify-btn").addEventListener("click", verifySHA256);
    document.getElementById("sha-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") verifySHA256();
    });
});
