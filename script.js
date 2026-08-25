const matrixValues = [
  "55", "1C", "BD", "E9", "7A",
  "E9", "BD", "55", "1C", "BD",
  "BD", "55", "1C", "E9", "55",
  "1C", "E9", "BD", "55", "1C",
  "55", "BD", "E9", "1C", "7A"
];

const matrixGrid = document.getElementById("matrix-grid");
const bufferSlots = [...document.querySelectorAll("#buffer-slots span")];
const resetBuffer = document.getElementById("reset-buffer");
const matrixRule = document.getElementById("matrix-rule");
const toast = document.getElementById("toast");
const bootScreen = document.getElementById("boot-screen");
const breachButton = document.getElementById("breach-button");
const bootOutput = document.getElementById("boot-output");
const sessionTime = document.getElementById("session-time");
const httpsState = document.getElementById("https-state");
const protocolReadout = document.getElementById("protocol-readout");
const hostReadout = document.getElementById("host-readout");
const footerSecurity = document.getElementById("footer-security");
const contactForm = document.getElementById("contact-form");
const submitButton = document.getElementById("submit-button");
const transmissionResult = document.getElementById("transmission-result");
const resultTerminalBody = document.getElementById("result-terminal-body");
const resultTerminalFoot = document.getElementById("result-terminal-foot");
const resultStatusCode = document.getElementById("result-status-code");
const daemonState = document.getElementById("daemon-state");
const daemonName = document.getElementById("daemon-name");
const daemonDescription = document.getElementById("daemon-description");
const resultClose = document.getElementById("result-close");

let buffer = [];
let sessionStart = Date.now();
let toastTimer;
let selectionAxis = "row";
let activeRow = 0;
let activeColumn = null;
const matrixButtons = [];

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateBuffer() {
  bufferSlots.forEach((slot, index) => {
    slot.textContent = buffer[index] || "--";
  });
}

function getRow(index) {
  return Math.floor(index / 5);
}

function getColumn(index) {
  return index % 5;
}

function updateMatrixAvailability() {
  matrixButtons.forEach((button, index) => {
    const row = getRow(index);
    const column = getColumn(index);
    let valid = false;

    if (!button.disabled) {
      if (selectionAxis === "row") {
        valid = row === activeRow;
      } else {
        valid = column === activeColumn;
      }
    }

    button.classList.toggle("valid", valid);
    button.classList.toggle("invalid", !valid && !button.classList.contains("selected"));
    button.tabIndex = valid ? 0 : -1;
    button.setAttribute("aria-disabled", valid ? "false" : "true");
  });

  if (buffer.length === 0) {
    matrixRule.textContent = "ICE BYPASS // SELECT ANY CODE IN FIRST ROW";
  } else if (selectionAxis === "column") {
    matrixRule.textContent = `ICE BYPASS // COLUMN ${activeColumn + 1} ACTIVE`;
  } else {
    matrixRule.textContent = `ICE BYPASS // ROW ${activeRow + 1} ACTIVE`;
  }
}

function selectMatrixCode(button, index) {
  if (buffer.length >= 4) {
    showToast("BUFFER FULL // RESET REQUIRED");
    return;
  }

  const row = getRow(index);
  const column = getColumn(index);
  const isValid = selectionAxis === "row" ? row === activeRow : column === activeColumn;

  if (!isValid || button.disabled) {
    showToast(selectionAxis === "row" ? `ROW ${activeRow + 1} REQUIRED` : `COLUMN ${activeColumn + 1} REQUIRED`);
    return;
  }

  buffer.push(button.textContent);
  button.classList.remove("valid", "invalid");
  button.classList.add("selected");
  button.disabled = true;
  updateBuffer();

  if (selectionAxis === "row") {
    activeColumn = column;
    selectionAxis = "column";
  } else {
    activeRow = row;
    selectionAxis = "row";
  }

  updateMatrixAvailability();

  if (buffer.length === 4) {
    showToast("BUFFER ACCEPTED // ICE BYPASS SIMULATION COMPLETE");
  }
}

matrixValues.forEach((value, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "matrix-code";
  button.textContent = value;
  button.setAttribute("aria-label", `Código ${value}, fila ${getRow(index) + 1}, columna ${getColumn(index) + 1}`);
  button.addEventListener("click", () => selectMatrixCode(button, index));
  matrixButtons.push(button);
  matrixGrid.appendChild(button);
});

updateMatrixAvailability();

resetBuffer.addEventListener("click", () => {
  buffer = [];
  selectionAxis = "row";
  activeRow = 0;
  activeColumn = null;
  updateBuffer();

  matrixButtons.forEach(button => {
    button.classList.remove("selected", "valid", "invalid");
    button.disabled = false;
  });

  updateMatrixAvailability();
  showToast("BUFFER CLEARED // FIRST ROW ACTIVE");
});

document.querySelectorAll(".locked-node").forEach(button => {
  button.addEventListener("click", () => {
    showToast(`${button.dataset.node} // NODE LOCKED // AVAILABLE IN NEXT DELIVERY`);
  });
});

function closeBoot() {
  bootScreen.classList.add("is-closing");
  bootScreen.setAttribute("aria-hidden", "true");
  setTimeout(() => {
    bootScreen.style.display = "none";
    document.querySelector(".brand").focus();
  }, 450);
}

function runBreach() {
  breachButton.disabled = true;
  breachButton.querySelector("span").textContent = "BREACHING...";
  const steps = [
    "Handshake accepted.",
    "ICE signature mirrored.",
    "Academic node authorization spoofed.",
    "ACCESS GRANTED."
  ];

  bootOutput.innerHTML = "";

  steps.forEach((step, index) => {
    setTimeout(() => {
      const line = document.createElement("span");
      line.textContent = `> ${step}`;
      bootOutput.appendChild(line);

      if (index === steps.length - 1) {
        setTimeout(closeBoot, 420);
      }
    }, index * 330);
  });
}

breachButton.addEventListener("click", runBreach);

document.addEventListener("keydown", event => {
  if (event.key === "Enter" && bootScreen.style.display !== "none" && !breachButton.disabled) {
    runBreach();
  }

  if (event.key === "Escape" && bootScreen.style.display !== "none") {
    closeBoot();
  }
});

function updateSessionTime() {
  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  sessionTime.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateSessionTime, 1000);
updateSessionTime();

const secure = window.location.protocol === "https:" || window.location.hostname === "localhost";
const protocol = window.location.protocol ? window.location.protocol.replace(":", "").toUpperCase() : "LOCAL";
const host = window.location.hostname || "LOCAL PREVIEW";

httpsState.textContent = secure ? "TLS / HTTPS ACTIVE" : "LOCAL PREVIEW / HTTPS ON DEPLOY";
protocolReadout.textContent = secure ? "HTTPS" : protocol;
hostReadout.textContent = host;
footerSecurity.textContent = secure ? "SECURE CONNECTION" : "LOCAL PREVIEW";

function renderTransmissionResult(success, statusCode = "") {
  transmissionResult.hidden = false;
  transmissionResult.classList.toggle("success", success);
  transmissionResult.classList.toggle("error", !success);

  const lines = success
    ? [
        "//ROOT",
        "//ACCESS_REQUEST",
        "//ACCESS_REQUEST_SUCCESS",
        "//COLLECTING_PACKET_1........................COMPLETE",
        "//COLLECTING_PACKET_2........................COMPLETE",
        "//COLLECTING_PACKET_3........................COMPLETE",
        "//FORM_RELAY.................................COMPLETE",
        "//UPLOAD_COMPLETE"
      ]
    : [
        "//ROOT",
        "//ACCESS_REQUEST",
        "//FORM_RELAY_INITIALIZED",
        "//PACKET_VALIDATION..........................FAILED",
        "//REMOTE_NODE_RESPONSE.......................REJECTED",
        "//UPLOAD_ABORTED",
        "//EXCEPTION_CAPTURED"
      ];

  resultTerminalBody.innerHTML = "";
  lines.forEach((text, index) => {
    const line = document.createElement("span");
    line.textContent = text;
    line.style.opacity = "0";
    resultTerminalBody.appendChild(line);

    setTimeout(() => {
      line.style.opacity = "1";
    }, index * 90);
  });

  resultStatusCode.textContent = success ? `STATUS ${statusCode || "200"}` : `ERROR ${statusCode || "NETWORK"}`;
  resultTerminalFoot.textContent = success ? "ALL PACKETS UPLOADED" : "UPLOAD FAILED // RETRY AVAILABLE";
  daemonState.textContent = success ? "INSTALLED" : "FAILED";
  daemonName.textContent = success ? "CONTACT_RELAY.V1" : "CONTACT_RELAY.V1";
  daemonDescription.textContent = success
    ? "Message payload delivered to remote node."
    : "Remote node rejected or could not receive the message payload.";

  resultClose.focus();
}

contactForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!contactForm.reportValidity()) {
    renderTransmissionResult(false, "VALIDATION");
    return;
  }

  const endpoint = contactForm.getAttribute("action");

  if (!endpoint || endpoint.includes("TU_FORM_ID")) {
    renderTransmissionResult(false, "CONFIG");
    showToast("FORMSPREE TOKEN REQUIRED");
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "TRANSMITTING...";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (response.ok) {
      renderTransmissionResult(true, response.status);
      contactForm.reset();
    } else {
      renderTransmissionResult(false, response.status);
    }
  } catch {
    renderTransmissionResult(false, "NETWORK");
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "TRANSMIT DATA";
  }
});

resultClose.addEventListener("click", () => {
  transmissionResult.hidden = true;
  transmissionResult.classList.remove("success", "error");
  contactForm.querySelector("input:not([type='hidden'])").focus();
});
