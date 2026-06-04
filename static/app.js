const video = document.getElementById("preview");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const fallbackUploadBtn = document.getElementById("fallbackUploadBtn");
const fallbackFileInput = document.getElementById("fallbackFileInput");
const statusToastEl = document.getElementById("statusToast");

let stream = null;
let facingMode = "environment";
let toastHideTimeoutId = null;

function hasLiveCameraApi() {
  return Boolean(
    window.isSecureContext &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function",
  );
}

function setStatus(text, variant = "") {
  if (!statusToastEl) {
    return;
  }

  statusToastEl.hidden = false;
  statusToastEl.textContent = text;
  statusToastEl.className = `toast ${variant}`.trim();

  // Restart animation for repeated updates.
  statusToastEl.classList.remove("show");
  void statusToastEl.offsetWidth;
  statusToastEl.classList.add("show");

  if (toastHideTimeoutId) {
    window.clearTimeout(toastHideTimeoutId);
  }

  toastHideTimeoutId = window.setTimeout(() => {
    statusToastEl.classList.remove("show");
    window.setTimeout(() => {
      statusToastEl.hidden = true;
    }, 220);
  }, 3200);
}

function setLiveCameraControlsEnabled(enabled) {
  captureBtn.disabled = !enabled;
  switchCameraBtn.disabled = !enabled;
}

function setFallbackVisible(visible) {
  fallbackUploadBtn.hidden = !visible;
}

function stopStream() {
  if (!stream) {
    return;
  }
  stream.getTracks().forEach((track) => track.stop());
  stream = null;
}

async function startCamera() {
  try {
    stopStream();

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();
    setLiveCameraControlsEnabled(true);
    setFallbackVisible(false);
    setStatus(`Kamera aktiv (${facingMode === "user" ? "Front" : "Rück"}).`, "ok");
  } catch (error) {
    console.error(error);
    setLiveCameraControlsEnabled(false);
    setFallbackVisible(true);

    if (error && error.name === "NotAllowedError") {
      setStatus("Kamerazugriff verweigert. Bitte Berechtigung im Browser aktivieren.", "error");
      return;
    }

    if (error && error.name === "NotFoundError") {
      setStatus("Keine Kamera gefunden. Nutze den Foto-Upload-Button als Fallback.", "error");
      return;
    }

    setStatus("Kamera konnte nicht gestartet werden. Nutze den Foto-Upload-Button.", "error");
  }
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

async function uploadImage(imageDataUrl) {
  const response = await fetch("/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Upload fehlgeschlagen.");
  }

  return result.filename;
}

async function capturePhoto() {
  if (!stream) {
    setStatus("Keine aktive Kamera.", "error");
    return;
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    setStatus("Kamerabild ist noch nicht bereit.", "error");
    return;
  }

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, width, height);

  // jpeg keeps upload size lower than png for mobile captures.
  const imageDataUrl = canvas.toDataURL("image/jpeg", 0.92);
  setStatus("Foto wird gespeichert...");

  try {
    const filename = await uploadImage(imageDataUrl);
    setStatus(`Gespeichert als ${filename}`, "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message, "error");
  }
}

async function uploadSelectedFile(file) {
  setStatus("Foto wird gespeichert...");

  try {
    const imageDataUrl = await fileToDataUrl(file);
    const filename = await uploadImage(imageDataUrl);
    setStatus(`Gespeichert als ${filename}`, "ok");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Upload fehlgeschlagen.", "error");
  }
}

captureBtn.addEventListener("click", () => {
  capturePhoto();
});

switchCameraBtn.addEventListener("click", async () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  await startCamera();
});

fallbackUploadBtn.addEventListener("click", () => {
  fallbackFileInput.click();
});

fallbackFileInput.addEventListener("change", async (event) => {
  const selectedFile = event.target.files && event.target.files[0];
  if (!selectedFile) {
    return;
  }

  await uploadSelectedFile(selectedFile);
  fallbackFileInput.value = "";
});

window.addEventListener("beforeunload", () => {
  stopStream();
});

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  setLiveCameraControlsEnabled(false);
  setFallbackVisible(true);

  if (!window.isSecureContext) {
    setStatus("Auf iPhone/Brave ist Live-Kamera nur mit HTTPS oder localhost verfuegbar. Nutze den Fallback-Button oder HTTPS.", "error");
  } else {
    setStatus("Browser unterstützt keine Live-Kamera-API. Nutze den Foto-Upload-Button.", "error");
  }
} else {
  setFallbackVisible(false);
  startCamera();
}
