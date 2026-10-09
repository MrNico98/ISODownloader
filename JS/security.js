const allowedHosts = new Set(["devuploads.com", "github.com"]);

export function isSha256(value) {
    return typeof value === "string" && /^[a-f\d]{64}$/i.test(value.trim());
}

export function safeExternalUrl(value) {
    if (typeof value !== "string" || value.length === 0) return null;

    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password || !allowedHosts.has(url.hostname)) return null;
        return url.href;
    } catch {
        return null;
    }
}
