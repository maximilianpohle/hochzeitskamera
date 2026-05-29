const video = document.getElementById("preview");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const statusEl = document.getElementById("status");

let stream = null;
let facingMode = "environment";

function setStatus(text, variant = "") {
  statusEl.textContent = text;
  statusEl.className = `status ${variant}`.trim();
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
    setStatus(`Kamera aktiv (${facingMode === "user" ? "Front" : "Rück"}).`, "ok");
  } catch (error) {
    console.error(error);
    setStatus(
      "Kamera konnte nicht gestartet werden. Bitte Berechtigung prüfen.",
      "error",
    );
  }
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

captureBtn.addEventListener("click", () => {
  capturePhoto();
});

switchCameraBtn.addEventListener("click", async () => {
  facingMode = facingMode === "environment" ? "user" : "environment";
  await startCamera();
});

window.addEventListener("beforeunload", () => {
  stopStream();
});

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  setStatus("Browser unterstützt keine Kamera-API.", "error");
} else {
  startCamera();
}
