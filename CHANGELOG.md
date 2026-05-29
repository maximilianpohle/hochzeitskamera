# Changelog

## 0.1.4 - 2026-05-29
- Frontend um HTTP-Fallback erweitert: Wenn Live-Kamera (getUserMedia) nicht verfuegbar ist, kann ein Foto ueber Kamera/Galerie ausgewaehlt und hochgeladen werden.
- Statusmeldungen fuer iPhone/Brave bei HTTP verbessert (Hinweis auf HTTPS/localhost).
- Upload-Endpoint akzeptiert nun mehrere Bild-MIME-Typen aus Data-URLs (z. B. jpeg/png/webp/heic).

## 0.1.3 - 2026-05-29
- Fehlerhafte GitHub-Action-Referenz fuer docker/setup-qemu-action korrigiert.
- Workflow nutzt nun docker/setup-qemu-action@v3 und ist damit wieder aufloesbar.

## 0.1.2 - 2026-05-29
- GitHub Actions Docker-Publish-Workflow auf Multi-Arch-Builds erweitert (linux/amd64, linux/arm64).
- QEMU-Setup im Workflow hinzugefuegt, damit arm64-Images auf dem CI-Runner gebaut und veroeffentlicht werden.

## 0.1.1 - 2026-05-29
- Dockerfile fuer Container-Deployment hinzugefuegt.
- .dockerignore fuer kleinere, saubere Builds hinzugefuegt.
- README um Docker-Start und Port-Hinweise (8080) erweitert.

## 0.1.0 - 2026-05-29
- Initiale Flask-WebApp erstellt.
- Mobile Kamera-Integration mit Front-/Rückkamera-Umschalter hinzugefügt.
- Foto-Upload und serverseitige Speicherung implementiert.
