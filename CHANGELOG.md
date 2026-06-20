# Changelog

## 0.1.22 - 2026-06-20
- Kamera-Aufnahmen werden nun als PNG exportiert, damit sie ohne JPEG-Kompression gespeichert werden.
- Galerie-Uploads bleiben unveraendert und verwenden weiterhin die Originaldatei.

## 0.1.21 - 2026-06-20
- JPEG-Qualitaet im Kamera-Pfad angehoben, damit Fotos weniger sichtbar komprimiert werden.
- Galerie-Uploads bleiben davon unberuehrt, da sie weiterhin die Originaldatei verwenden.

## 0.1.20 - 2026-06-20
- Datei-Upload auf iPhone korrigiert, indem das `capture`-Attribut vom versteckten Datei-Input entfernt wurde.
- Dadurch ist die Galerie-Auswahl wieder verfuegbar, statt den Dialog auf Kamera-Verhalten zu beschraenken.

## 0.1.19 - 2026-06-05
- Komplettes Frontend-Farbschema auf Eukalyptus-Palette umgestellt (Hintergrund, Karte, Buttons, Toasts, Versionsanzeige).
- Alle warmen Rot-/Beige-Toene durch harmonische Gruen- und Salbeiabstufungen ersetzt.

## 0.1.18 - 2026-06-04
- Fallback-Option "Foto via Kamera/Galerie wählen" ist nun immer sichtbar, auch wenn Live-Kamera aktiv ist.
- Ermoeglicht jederzeit den direkten Wechsel auf die Handy-Kamera/Galerie-Auswahl.

## 0.1.17 - 2026-06-04
- Nginx-User explizit auf `root` gesetzt, damit in rootless/podman Setups kein `chown(..., 101)` auf Temp-Verzeichnisse fehlschlaegt.
- Behebt den wiederholten Startfehler `Operation not permitted` bei `client_temp`.

## 0.1.16 - 2026-06-04
- Nginx-Konfiguration auf neue HTTP/2-Syntax umgestellt (`listen 443 ssl;` + `http2 on;`) und Deprecation-Warnung behoben.
- Nginx-Temp-Pfade explizit nach `/tmp/*` verlegt, damit in gehaerteten/rootless Containern kein `chown` auf `/var/cache/nginx/client_temp` mehr fehlschlaegt.

## 0.1.15 - 2026-06-04
- Compose-Healthcheck fuer den App-Container auf robuste CMD-SHELL-Variante umgestellt.
- Fix fuer Podman/Docker-Compose Parsing-Problem, bei dem der Python `-c` Ausdruck falsch zerlegt wurde und der Container dadurch `unhealthy` blieb.

## 0.1.14 - 2026-06-04
- Client-IP-Erkennung im Backend erweitert: X-Real-IP wird nun bevorzugt ausgewertet (mit Fallback auf X-Forwarded-For und remote_addr).

## 0.1.13 - 2026-06-04
- Upload-Endpoint um serverseitiges IP-Rate-Limit erweitert: maximal 20 Bilder pro Sekunde pro IP.
- Bei Ueberschreitung wird HTTP 429 (Too Many Requests) zurueckgegeben.

## 0.1.12 - 2026-06-04
- Docker-Setup gehaertet: App laeuft als Non-Root-User mit Gunicorn statt Flask-Dev-Server.
- Healthchecks fuer App und Nginx in docker-compose hinzugefuegt sowie Startabhaengigkeit auf service_healthy gesetzt.
- Container-Sicherheitsoptionen aktiviert: read_only Root-Filesystem, no-new-privileges, Capabilities reduziert, tmpfs fuer Schreibpfade.
- Nginx gehaertet: server_tokens off, zusaetzliche Security-Header, PID in /tmp und restriktivere Zertifikat-Dateirechte.

## 0.1.11 - 2026-06-04
- Kleine Versionsnummer unten rechts im UI angezeigt.
- Versionsanzeige wird dynamisch aus der Datei VERSION gelesen.

## 0.1.10 - 2026-06-04
- Speichern-Button im Erfolgs-Toast unter die Meldung verschoben (eigene Zeile fuer bessere Lesbarkeit).

## 0.1.9 - 2026-06-04
- Erfolgs-Toast nach Upload um eine Aktion erweitert: "💾 Speichern" startet den lokalen Bild-Download.
- Download-Dateiname wird aus dem Server-Dateinamen und Bildformat abgeleitet.

## 0.1.8 - 2026-06-04
- Ueberschrift im oberen Bereich entfernt, damit mehr Platz fuer das Kamerabild verfuegbar ist.
- Mobile Layout auf Vollhoehe optimiert, damit die Seite auf Handys nicht mehr gescrollt werden muss.
- Button-Reihenfolge auf Handys angepasst: "Foto aufnehmen" ist nun der unterste Button.

## 0.1.7 - 2026-06-04
- Untere Status-Textanzeige im Kartenbereich entfernt.
- Rueckmeldungen werden jetzt ausschliesslich ueber das obere Toast-Popup angezeigt.

## 0.1.6 - 2026-06-04
- Statusmeldungen (z. B. "Gespeichert als ...") werden nun als Toast-Popup am oberen Bildschirmrand angezeigt.
- Nutzer muessen fuer wichtige Rueckmeldungen nicht mehr nach unten scrollen.

## 0.1.5 - 2026-05-29
- Docker Compose Setup hinzugefuegt.
- Nginx als Reverse Proxy vor die Flask-App gesetzt.
- HTTPS-Termination mit automatischer Erstellung eines selbstsignierten Zertifikats im Nginx-Container hinzugefuegt.
- HTTP-auf-HTTPS-Redirect ueber Nginx konfiguriert.

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
