# MagentaCloud-Button (Nginx)

Dieses Projekt stellt eine sehr einfache Webseite ueber Nginx bereit. Die Seite zeigt nur einen Button, der auf folgende URL verlinkt:

- https://magentacloud.de/s/yEna9fya9EEMyPP

## Start mit Docker Compose

1. Stack bauen und starten:
   ```bash
   docker compose up --build -d
   ```
2. Im Browser oeffnen:
   - Lokal: `http://127.0.0.1`
   - Im WLAN: `http://<DEINE-RECHNER-IP>`
3. Logs pruefen (optional):
   ```bash
   docker compose logs -f
   ```

## Technische Details

- Ein einzelner Nginx-Container bedient statische Dateien.
- Es gibt einen Health-Endpoint unter `http://<host>/healthz`.
