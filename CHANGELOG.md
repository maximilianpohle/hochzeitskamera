# Changelog

## 0.1.53 - 2026-06-21
- Anleitungstext im Foto-Quiz praezisiert: Seite nach jedem Foto offen lassen, bis die Speicher-Meldung erscheint.
- Hinweis ergaenzt, dass bei laufenden Uploads nicht geschlossen oder neu geladen werden soll, bis die Speicherung bestaetigt ist.

## 0.1.52 - 2026-06-21
- Speicherprobleme auf manchen Android-Geraeten reduziert: sehr grosse Bilder werden vor der Konvertierung automatisch auf ein sicheres Verarbeitungs-Limit skaliert.
- Upload-Pipeline auf async/await umgestellt und Canvas-Speicher nach JPG/PNG-Upload explizit freigegeben, um OOM-Fehler wie "zu wenig speicher fuer vorherige operation" zu vermeiden.

## 0.1.51 - 2026-06-20
- Vertikale Zentrierung im Intro-Bereich weiter verstaerkt: hoehere, viewport-relative Intro-Hoehe und mittige Grid-Ausrichtung.
- Mobile Intro-Hoehe ebenfalls angepasst, damit die Zentrierung dort klar sichtbar bleibt.

## 0.1.50 - 2026-06-20
- Vertikale Zentrierung des Intro-Textes robuster umgesetzt: Intro-Bereich nutzt jetzt den verfuegbaren Raum innerhalb der Karte.
- `camera-card` auf Flex-Layout umgestellt, damit der Textbereich sichtbar mittig sitzt.

## 0.1.49 - 2026-06-20
- Anleitungstext im Intro-Bereich zusaetzlich vertikal zentriert.
- Intro-Absatzbreite begrenzt, damit die zentrierte Darstellung ruhiger und lesbarer bleibt.

## 0.1.48 - 2026-06-20
- Ueberschrift "Foto-Quiz" erneut vergroessert (Desktop und Mobil), damit sie deutlich praesenter ist.

## 0.1.47 - 2026-06-20
- Rahmen am `quiz.png`-Bild entfernt, damit das Bild ohne Rand dargestellt wird.

## 0.1.46 - 2026-06-20
- Titel-, Anleitungs- und Upload-Banner-Text zentriert.
- Eigene Kasten-Optik fuer Unterbereiche entfernt, damit nur noch die Hauptkarte als gemeinsamer Rahmen wirkt.

## 0.1.45 - 2026-06-20
- Gesamte Typografie vergroessert: Basistext, Intro-Text, Upload-Banner, Toast und Button-Beschriftungen.
- Button-Hoehe leicht erhoeht, damit die groessere Schrift sauber und gut lesbar bleibt.

## 0.1.44 - 2026-06-20
- Button-Leiste auf `fixed` umgestellt und direkt an den unteren Bildschirmrand gepinnt.
- Safe-Area-Beruecksichtigung und zusaetzlicher Karten-Innenabstand hinzugefuegt, damit Inhalte nicht von der Leiste ueberdeckt werden.

## 0.1.43 - 2026-06-20
- Ueberschrift, `quiz.png` und Anleitungstext in dieselbe Karte wie die Buttons verschoben.
- Oberer Inhaltsbereich nutzt jetzt dasselbe Rechteck wie die Steuer-Buttons (ein gemeinsamer Karten-Container).

## 0.1.42 - 2026-06-20
- Ueberschrift "Foto-Quiz" deutlich vergroessert.
- Gewuenschten Anleitungstext unter dem `quiz.png`-Bild eingefuegt.
- Mobile Layout feinjustiert, damit Titel, Bild, Text und Kartenbereich gemeinsam sichtbar bleiben.

## 0.1.41 - 2026-06-20
- `quiz.png` als sichtbares Hero-Bild unter der Ueberschrift in die Startseite eingebunden.
- Backend-Route fuer den Ordner `img/` hinzugefuegt, damit Bild-Assets stabil ausgeliefert werden.

## 0.1.40 - 2026-06-20
- Button-Leiste im Kamerabereich an den unteren Rand gepinnt.
- Steuer-Buttons bleiben damit sichtbar und unten verankert, auch bei variierender Viewport-Hoehe.

## 0.1.39 - 2026-06-20
- Neue Ueberschrift "Foto-Quiz" im oberen Bereich hinzugefuegt, damit der freie Platz genutzt wird.
- Titel-Layout fuer Desktop und Mobilansicht passend gestylt.

## 0.1.38 - 2026-06-20
- Upload-Groessenlimit fuer den Server auf 80 MB angehoben, damit grosse PNG-Dateien nicht mehr vorzeitig abgewiesen werden.
- Bei zu grossen Payloads gibt der Server jetzt eine klare JSON-Fehlermeldung (HTTP 413) zurueck.
- Frontend-Uploadfehler verbessert: auch bei nicht-JSON Antworten wird eine verstaendliche Meldung angezeigt.

## 0.1.37 - 2026-06-20
- Aufnehmen-Button auf nativen Kamera-App-Modus umgestellt: statt Live-Video wird immer die Kamera-App geoeffnet.
- Live-Preview und Front/Rueckkamera-Schalter werden in diesem Modus ausgeblendet, um unscharfe Video-Frame-Aufnahmen zu vermeiden.

## 0.1.36 - 2026-06-20
- Kamera-Aufloesungs-Optimierung bricht nicht mehr still ab: bei fehlenden Capabilities oder fehlgeschlagenem Setzen wird ein Fallback genutzt.
- Statt Abbruch wird ein sichtbarer Warnhinweis angezeigt, waehrend die Kamera normal weiterlaeuft.

## 0.1.35 - 2026-06-20
- Live-Kamera fragt nicht mehr Full-HD als Ziel an, sondern versucht die maximal verfuegbare Video-Track-Aufloesung des Geraets zu nutzen.
- Nach dem Start werden die Kamera-Capabilities ausgewertet und auf die hoechstmoegliche Aufloesung angehoben, falls der Browser das erlaubt.

## 0.1.34 - 2026-06-20
- Upload-Banner wieder eingebaut, damit laufende Uploads sichtbar bleiben.
- Banner reagiert auf den Hintergrund-Upload-Zaehler und verschwindet automatisch, wenn alles fertig ist.

## 0.1.33 - 2026-06-20
- PNG-Erzeugung wird erst nach erfolgreichem JPG-Upload gestartet, damit der schnelle JPG-Request nicht blockiert wird.
- Das reduziert die Wartezeit bis zum ersten Upload weiter, vor allem bei grossen Bildern.

## 0.1.32 - 2026-06-20
- JPG-Upload wird jetzt vor PNG priorisiert, damit der kleine Upload moeglichst frueh startet.
- Das Backend vergibt die capture_id beim ersten Upload und die PNG-Datei haengt sich daran an.

## 0.1.31 - 2026-06-20
- Upload-API auf einen Bundle-Upload umgestellt, damit JPG und PNG vom Backend gemeinsam eine ID bekommen.
- Das Backend vergibt den Bildstamm jetzt selbst und schreibt beide Varianten mit derselben capture_id in einen gemeinsamen Dateistamm.

## 0.1.30 - 2026-06-20
- JPG und PNG bekommen jetzt denselben gemeinsamen Bild-Stamm ueber eine uploadseitige capture_id.
- Die beiden Varianten unterscheiden sich nur noch in der Dateiendung, nicht mehr in der zufaelligen ID.

## 0.1.29 - 2026-06-20
- Galerie-Uploads werden jetzt direkt als Blob geladen statt zuerst als Data-URL, um "load failed" bei iPhone-Dateien zu vermeiden.
- JPEG- und PNG-Varianten bleiben erhalten; die Konvertierung nutzt nun den robusteren Ladepfad.

## 0.1.28 - 2026-06-20
- Pro Bild werden jetzt zwei Uploads erzeugt: ein kleineres JPEG mit hoher Qualitaet und eine unkomprimierte PNG-Version.
- Kamera- und Galerie-Bilder werden dafuer zuerst in gemeinsame Bildvarianten umgerechnet und dann parallel hochgeladen.

## 0.1.27 - 2026-06-20
- Upload-Statusbar/Banner wieder entfernt, damit die Oberfläche ruhiger bleibt.
- Hintergrund-Uploads und die Warnung beim Verlassen der Seite bleiben weiterhin aktiv.

## 0.1.26 - 2026-06-20
- Upload-Banner sprachlich entschärft, damit er nicht wie eine feste Reihenfolge wirkt.
- Anzeige betont jetzt nur noch die noch laufenden Uploads im Hintergrund.

## 0.1.25 - 2026-06-20
- Upload-Banner optisch als aktive Warteschlange mit Balken gestaltet, damit ausstehende Uploads nicht wie ein Hänger wirken.
- Text im Banner praeziser formuliert, wenn mehrere Bilder noch im Hintergrund laufen.

## 0.1.24 - 2026-06-20
- Banner fuer ausstehende Uploads hinzugefuegt, damit sichtbar bleibt, wenn Bilder noch verarbeitet werden.
- Vor dem Verlassen der Seite wird jetzt bei laufenden Uploads eine Browser-Warnung angezeigt.

## 0.1.23 - 2026-06-20
- Uploads laufen nun im Hintergrund, damit direkt nach dem Ausloesen das naechste Bild geschossen werden kann.
- PNG-Kamera-Aufnahmen und Galerie-Uploads werden asynchron verarbeitet; die Kamera bleibt dabei sofort bedienbar.

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
