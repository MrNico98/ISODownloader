# ISODownloader

Static browser application for browsing the repository's ISO link catalog and calculating SHA-256 checksums locally.

## Run locally

Serve the repository root with Python's standard-library server (ES modules do not work reliably from `file://`):

```sh
python -m http.server 8000
```

Open the printed local URL. The checksum operation runs in the browser; ISO files are not uploaded by this application.

## Verification

Requires Node.js 22 or newer. Run `npm test` to validate hash parsing, external-link policy, and catalog integrity.

## Sources and safety

Catalog entries link to third-party hosting services and include customized images. The project does not host or independently authenticate those files. Listed checksums are project-provided values, not proof of publisher identity or safety. Verify provenance through an authoritative source before using an image. Prefer Microsoft distribution channels for official Windows media.

The browser uses the pinned `hash-wasm` and Font Awesome CDN assets with Subresource Integrity. GitHub Pages deploys the static site from `main`.
