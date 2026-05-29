# Hochzeitskamera mit Flask

Diese WebApp greift auf die Kamera des Handys zu, nimmt ein Foto auf und speichert es direkt auf dem Server im Ordner `uploads/`.

## Features

- Mobilfreundliche Oberfläche
- Zugriff auf Handy-Kamera via Browser (`getUserMedia`)
- Umschalten zwischen Front- und Rückkamera
- Fotoaufnahme und Upload zum Flask-Server
- Speicherung als JPEG mit Zeitstempel

## Start

1. Virtuelle Umgebung erstellen und aktivieren (optional):
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```
3. App starten:
   ```bash
   python app.py
   ```
4. Im Browser öffnen:
   - Lokal: `http://127.0.0.1:5000`
   - Vom Handy im gleichen Netzwerk: `http://<DEINE-RECHNER-IP>:5000`

## Wichtiger Hinweis zu Kamera auf Handys

Viele mobile Browser erlauben Kamerazugriff nur auf:

- `https://` Seiten oder
- `localhost`

Für echte Nutzung auf dem Handy im WLAN ist daher oft HTTPS nötig (z. B. via Reverse Proxy oder Tunnel).

## Speicherort der Fotos

Hochgeladene Bilder liegen in:

- `uploads/hochzeit_YYYYMMDD_HHMMSS_<id>.jpg`
# hochzeitskamera
