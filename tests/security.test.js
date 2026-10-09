import test from "node:test";
import assert from "node:assert/strict";
import { isoData } from "../JS/data.js";
import { isSha256, safeExternalUrl } from "../JS/security.js";

test("SHA-256 accepts exactly 64 hexadecimal characters", () => {
    assert.equal(isSha256("a".repeat(64)), true);
    assert.equal(isSha256("A".repeat(64)), true);
    assert.equal(isSha256("a".repeat(63)), false);
    assert.equal(isSha256(`${"a".repeat(63)}g`), false);
    assert.equal(isSha256(null), false);
});

test("external links allow only HTTPS links on the documented hosts", () => {
    assert.equal(safeExternalUrl("https://devuploads.com/example"), "https://devuploads.com/example");
    assert.equal(safeExternalUrl("https://github.com/user/repo"), "https://github.com/user/repo");
    assert.equal(safeExternalUrl("javascript:alert(1)"), null);
    assert.equal(safeExternalUrl("http://devuploads.com/example"), null);
    assert.equal(safeExternalUrl("https://devuploads.com.example.org/file"), null);
    assert.equal(safeExternalUrl("https://user:pass@github.com/file"), null);
    assert.equal(safeExternalUrl(""), null);
});

test("every catalog entry has either a valid declared hash or no hash and safe link", () => {
    for (const languages of Object.values(isoData)) {
        for (const entries of Object.values(languages)) {
            for (const item of Object.values(entries)) {
                assert.ok(item.sha256 === "" || isSha256(item.sha256), `invalid hash for ${item.versione}`);
                assert.ok(item.link === "" || safeExternalUrl(item.link), `unsafe link for ${item.versione}`);
            }
        }
    }
});
