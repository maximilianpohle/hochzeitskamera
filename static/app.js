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
let pendingUploads = 0;

function hasLiveCameraApi() {
  return Boolean(
    window.isSecureContext &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function",
  );
}

function inferExtensionFromDataUrl(imageDataUrl) {
  const mimeMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/.exec(imageDataUrl || "");
  if (!mimeMatch) {
    return "jpg";
  }

  const mimeType = mimeMatch[1].toLowerCase();
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  if (mimeType === "image/png") {
    return "png";
  }
  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

function buildDownloadFilename(serverFilename, imageDataUrl) {
  if (serverFilename && /\.[a-z0-9]+$/i.test(serverFilename)) {
    return serverFilename;
  }

  const extension = inferExtensionFromDataUrl(imageDataUrl);
  if (serverFilename) {
    return `${serverFilename}.${extension}`;
  }

  return `foto-${Date.now()}.${extension}`;
}

function downloadImage(imageDataUrl, serverFilename) {
  const downloadName = buildDownloadFilename(serverFilename, imageDataUrl);
  const downloadLink = document.createElement("a");
  downloadLink.href = imageDataUrl;
  downloadLink.download = downloadName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setStatus(`Download gestartet: ${downloadName}`, "ok");
}

function setStatus(text, variant = "", options = {}) {
  if (!statusToastEl) {
    return;
  }

  statusToastEl.hidden = false;
  statusToastEl.className = `toast ${variant}`.trim();

  statusToastEl.textContent = "";
  const contentEl = document.createElement("div");
  contentEl.className = "toast-content";

  const messageEl = document.createElement("span");
  messageEl.className = "toast-message";
  messageEl.textContent = text;
  contentEl.appendChild(messageEl);

  if (options.actionLabel && typeof options.actionHandler === "function") {
    const actionBtn = document.createElement("button");
    actionBtn.type = "button";
    actionBtn.className = "toast-action-btn";
    actionBtn.textContent = options.actionLabel;
    actionBtn.addEventListener("click", () => {
      try {
        options.actionHandler();
      } catch (error) {
        console.error(error);
        setStatus("Download konnte nicht gestartet werden.", "error");
      }
    });
    contentEl.appendChild(actionBtn);
  }

  statusToastEl.appendChild(contentEl);

  // Restart animation for repeated updates.
  statusToastEl.classList.remove("show");
  void statusToastEl.offsetWidth;
  statusToastEl.classList.add("show");

  if (toastHideTimeoutId) {
    window.clearTimeout(toastHideTimeoutId);
  }

  const hideAfterMs = options.actionLabel ? 6500 : 3200;

  toastHideTimeoutId = window.setTimeout(() => {
    statusToastEl.classList.remove("show");
    window.setTimeout(() => {
      statusToastEl.hidden = true;
    }, 220);
  }, hideAfterMs);
}

function setLiveCameraControlsEnabled(enabled) {
  captureBtn.disabled = !enabled;
  switchCameraBtn.disabled = !enabled;
}

function setFallbackVisible(visible) {
  fallbackUploadBtn.hidden = !visible;
}

function waitForImageLoad(imageElement, sourceUrl) {
  return new Promise((resolve, reject) => {
    imageElement.onload = () => resolve();
    imageElement.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
    imageElement.src = sourceUrl;
  });
}

async function loadImageElement(source) {
  const imageElement = new Image();
  imageElement.decoding = "async";

  if (source instanceof Blob) {
    const objectUrl = URL.createObjectURL(source);

    try {
      await waitForImageLoad(imageElement, objectUrl);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    return imageElement;
  }

  await waitForImageLoad(imageElement, source);
  return imageElement;
}

function drawScaledImageToCanvas(imageElement, targetCanvas, maxWidth, maxHeight) {
  const sourceWidth = imageElement.naturalWidth || imageElement.width;
  const sourceHeight = imageElement.naturalHeight || imageElement.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Bildabmessungen konnten nicht bestimmt werden.");
  }

  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;

  const context = targetCanvas.getContext("2d");
  context.drawImage(imageElement, 0, 0, targetWidth, targetHeight);
}

async function createCaptureVariants(imageSource) {
  const imageElement = await loadImageElement(imageSource);

  const jpegCanvas = document.createElement("canvas");
  const pngCanvas = document.createElement("canvas");

  drawScaledImageToCanvas(imageElement, jpegCanvas, 1600, 1600);

  pngCanvas.width = imageElement.naturalWidth || imageElement.width;
  pngCanvas.height = imageElement.naturalHeight || imageElement.height;
  pngCanvas.getContext("2d").drawImage(imageElement, 0, 0, pngCanvas.width, pngCanvas.height);

  return {
    jpegDataUrl: jpegCanvas.toDataURL("image/jpeg", 0.98),
    pngDataUrl: pngCanvas.toDataURL("image/png"),
  };
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
    setFallbackVisible(true);
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

function uploadImageInBackground(imageDataUrl, onSuccess) {
  pendingUploads += 1;

  void (async () => {
    try {
      const filename = await uploadImage(imageDataUrl);
      onSuccess(filename);
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload fehlgeschlagen.", "error");
    } finally {
      pendingUploads = Math.max(0, pendingUploads - 1);
    }
  })();
}

function uploadCaptureVariantsInBackground(variants, onSuccess) {
  pendingUploads += 2;

  void (async () => {
    try {
      const [jpegFilename, pngFilename] = await Promise.all([
        uploadImage(variants.jpegDataUrl),
        uploadImage(variants.pngDataUrl),
      ]);
      onSuccess({ jpegFilename, pngFilename });
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload fehlgeschlagen.", "error");
    } finally {
      pendingUploads = Math.max(0, pendingUploads - 2);
    }
  })();
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

  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  const originalCaptureDataUrl = canvas.toDataURL("image/png");
  setStatus("Foto aufgenommen. Upload laeuft im Hintergrund...");

  try {
    const variants = await createCaptureVariants(originalCaptureDataUrl);
    uploadCaptureVariantsInBackground(variants, ({ jpegFilename, pngFilename }) => {
      setStatus(`Gespeichert als ${jpegFilename} und ${pngFilename}`, "ok", {
        actionLabel: "💾 Speichern",
        actionHandler: () => downloadImage(variants.pngDataUrl, pngFilename),
      });
    });
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Bild konnte nicht vorbereitet werden.", "error");
  }
}

async function uploadSelectedFile(file) {
  setStatus("Foto wird gelesen...");

  try {
    const variants = await createCaptureVariants(file);
    setStatus("Foto geladen. Upload laeuft im Hintergrund...");
    uploadCaptureVariantsInBackground(variants, ({ jpegFilename, pngFilename }) => {
      setStatus(`Gespeichert als ${jpegFilename} und ${pngFilename}`, "ok", {
        actionLabel: "💾 Speichern",
        actionHandler: () => downloadImage(variants.pngDataUrl, pngFilename),
      });
    });
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

window.addEventListener("beforeunload", (event) => {
  if (pendingUploads <= 0) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
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
  setFallbackVisible(true);
  startCamera();
}
