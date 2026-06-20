const video = document.getElementById("preview");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const cameraFileInput = document.getElementById("cameraFileInput");
const fallbackUploadBtn = document.getElementById("fallbackUploadBtn");
const fallbackFileInput = document.getElementById("fallbackFileInput");
const uploadBannerEl = document.getElementById("uploadBanner");
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

function updateUploadBanner() {
  if (!uploadBannerEl) {
    return;
  }

  if (pendingUploads <= 0) {
    uploadBannerEl.hidden = true;
    uploadBannerEl.textContent = "";
    return;
  }

  uploadBannerEl.hidden = false;
  uploadBannerEl.textContent =
    pendingUploads === 1
      ? "1 Bild wird noch hochgeladen. Bitte die Seite offen lassen."
      : `${pendingUploads} Bilder werden noch hochgeladen. Bitte die Seite offen lassen.`;
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

function getSourceDimensions(source) {
  const sourceWidth = source.naturalWidth || source.videoWidth || source.width;
  const sourceHeight = source.naturalHeight || source.videoHeight || source.height;

  return { sourceWidth, sourceHeight };
}

function createCanvasFromImageSource(source) {
  const { sourceWidth, sourceHeight } = getSourceDimensions(source);

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Bildabmessungen konnten nicht bestimmt werden.");
  }

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceWidth;
  sourceCanvas.height = sourceHeight;

  const context = sourceCanvas.getContext("2d");
  context.drawImage(source, 0, 0, sourceWidth, sourceHeight);
  return sourceCanvas;
}

function drawScaledCanvasToCanvas(sourceCanvas, targetCanvas, maxWidth, maxHeight) {
  const { sourceWidth, sourceHeight } = getSourceDimensions(sourceCanvas);

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Bildabmessungen konnten nicht bestimmt werden.");
  }

  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  targetCanvas.width = targetWidth;
  targetCanvas.height = targetHeight;

  const context = targetCanvas.getContext("2d");
  context.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
}

function createJpegDataUrl(sourceCanvas) {
  const jpegCanvas = document.createElement("canvas");
  drawScaledCanvasToCanvas(sourceCanvas, jpegCanvas, 1600, 1600);
  return jpegCanvas.toDataURL("image/jpeg", 0.98);
}

function createPngDataUrl(sourceCanvas) {
  return sourceCanvas.toDataURL("image/png");
}

async function createCaptureSource(source) {
  if (source instanceof HTMLCanvasElement) {
    return source;
  }

  const imageElement = await loadImageElement(source);
  return createCanvasFromImageSource(imageElement);
}

function stopStream() {
  if (!stream) {
    return;
  }
  stream.getTracks().forEach((track) => track.stop());
  stream = null;
}

async function maximizeVideoTrackResolution(activeStream) {
  const videoTrack = activeStream && activeStream.getVideoTracks && activeStream.getVideoTracks()[0];
  if (!videoTrack) {
    return { fallbackUsed: true, reason: "Kein Video-Track verfuegbar." };
  }

  if (
    typeof videoTrack.getCapabilities !== "function" ||
    typeof videoTrack.applyConstraints !== "function"
  ) {
    return { fallbackUsed: true, reason: "Browser unterstuetzt keine Aufloesungs-Capabilities." };
  }

  const capabilities = videoTrack.getCapabilities();
  const maxWidth = capabilities.width && typeof capabilities.width.max === "number" ? capabilities.width.max : null;
  const maxHeight = capabilities.height && typeof capabilities.height.max === "number" ? capabilities.height.max : null;

  if (!maxWidth && !maxHeight) {
    return { fallbackUsed: true, reason: "Maximale Kamera-Aufloesung konnte nicht ausgelesen werden." };
  }

  const constraints = {};
  if (maxWidth) {
    constraints.width = { ideal: maxWidth };
  }
  if (maxHeight) {
    constraints.height = { ideal: maxHeight };
  }

  try {
    await videoTrack.applyConstraints(constraints);
    return { fallbackUsed: false, reason: null };
  } catch (error) {
    console.warn("Maximale Aufloesung konnte nicht gesetzt werden:", error);
    return { fallbackUsed: true, reason: "Maximale Kamera-Aufloesung konnte nicht gesetzt werden." };
  }
}

async function startCamera() {
  try {
    stopStream();

    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
      },
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    const resolutionResult = await maximizeVideoTrackResolution(stream);
    video.srcObject = stream;
    await video.play();
    setLiveCameraControlsEnabled(true);
    setFallbackVisible(true);

    if (resolutionResult && resolutionResult.fallbackUsed) {
      setStatus(
        `Kamera aktiv (${facingMode === "user" ? "Front" : "Rück"}). Fallback aktiv: ${resolutionResult.reason}`,
        "warn",
      );
    } else {
      setStatus(`Kamera aktiv (${facingMode === "user" ? "Front" : "Rück"}).`, "ok");
    }
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

async function uploadImage(imageDataUrl, captureId) {
  const response = await fetch("/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageDataUrl, capture_id: captureId }),
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Upload fehlgeschlagen.");
  }

  return result;
}

function uploadImageInBackground(imageDataUrl, captureId, onSuccess) {
  pendingUploads += 1;
  updateUploadBanner();

  void (async () => {
    try {
      const result = await uploadImage(imageDataUrl, captureId);
      onSuccess(result);
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload fehlgeschlagen.", "error");
    } finally {
      pendingUploads = Math.max(0, pendingUploads - 1);
      updateUploadBanner();
    }
  })();
}

function uploadJpegThenPngInBackground(sourceCanvas) {
  const jpegDataUrl = createJpegDataUrl(sourceCanvas);

  setStatus("JPG wird hochgeladen...");

  uploadImageInBackground(jpegDataUrl, undefined, (jpegResult) => {
    const pngDataUrl = createPngDataUrl(sourceCanvas);
    setStatus(`JPG gespeichert als ${jpegResult.filename}. PNG folgt...`, "ok");

    uploadImageInBackground(pngDataUrl, jpegResult.capture_id, (pngResult) => {
      setStatus(`Gespeichert als ${jpegResult.filename} und ${pngResult.filename}`, "ok", {
        actionLabel: "💾 Speichern",
        actionHandler: () => downloadImage(pngDataUrl, pngResult.filename),
      });
    });
  });
}

async function capturePhoto() {
  if (!cameraFileInput) {
    setStatus("Kamera-App steht nicht zur Verfuegung.", "error");
    return;
  }

  setStatus("Kamera-App wird geoeffnet...");
  cameraFileInput.click();
}

async function uploadSelectedFile(file) {
  setStatus("Foto wird gelesen...");

  try {
    const sourceCanvas = await createCaptureSource(file);
    setStatus("Foto geladen. JPG wird hochgeladen...");
    uploadJpegThenPngInBackground(sourceCanvas);
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

cameraFileInput.addEventListener("change", async (event) => {
  const selectedFile = event.target.files && event.target.files[0];
  if (!selectedFile) {
    return;
  }

  await uploadSelectedFile(selectedFile);
  cameraFileInput.value = "";
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
  setFallbackVisible(true);
  switchCameraBtn.hidden = true;
  video.hidden = true;
  setStatus("Kamera-App-Modus aktiv. 'Foto aufnehmen' nutzt die native Kamera-App.", "ok");
} else {
  switchCameraBtn.hidden = true;
  video.hidden = true;
  setFallbackVisible(true);
  setStatus("Kamera-App-Modus aktiv. 'Foto aufnehmen' nutzt die native Kamera-App.", "ok");
}
