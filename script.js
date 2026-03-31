// --- Dark Mode ---
function initDarkMode() {
  const saved = localStorage.getItem("digitalq-dark-mode");
  if (
    saved === "true" ||
    (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
  }
}

function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  localStorage.setItem("digitalq-dark-mode", isDark);
  lucide.createIcons();
}

initDarkMode();

// --- QR Code ---
function getQRUrl() {
  // Default to the deployed GitHub Pages URL
  return "https://sriram-narandas.github.io/DigitalQ";
}

function generateQRImage(url) {
  const container = document.getElementById("qr-code-container");
  const urlDisplay = document.getElementById("qr-url-display");
  if (!container) return;
  container.innerHTML = "";

  if (url.startsWith("file://")) {
    container.innerHTML =
      '<p class="text-amber-500 text-sm font-semibold">\u26a0 Cannot generate QR for local files.<br>Deploy via GitHub Pages first.</p>';
    if (urlDisplay) urlDisplay.textContent = url;
    return;
  }

  const img = document.createElement("img");
  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1e293b&bgcolor=ffffff&data=" +
    encodeURIComponent(url);
  img.width = 200;
  img.height = 200;
  img.alt = "QR Code";
  img.style.borderRadius = "8px";
  img.onerror = function () {
    container.innerHTML =
      '<p class="text-red-500 text-sm">Failed to load QR code. Check your internet connection.</p>';
  };
  container.appendChild(img);
  if (urlDisplay) urlDisplay.textContent = url;
}

function showQRModal() {
  const modal = document.getElementById("qr-modal");
  if (modal) modal.classList.remove("hidden");
  const urlInput = document.getElementById("qr-url-input");
  const qrUrl = getQRUrl();
  if (urlInput) urlInput.value = qrUrl;
  generateQRImage(qrUrl);
  lucide.createIcons();
}

function regenerateQR() {
  const urlInput = document.getElementById("qr-url-input");
  if (!urlInput || !urlInput.value.trim()) {
    showToast("Please enter a URL");
    return;
  }
  generateQRImage(urlInput.value.trim());
}

function closeQRModal() {
  const modal = document.getElementById("qr-modal");
  if (modal) modal.classList.add("hidden");
}

function printQRCode() {
  const container = document.getElementById("qr-code-container");
  const qrImg = container ? container.querySelector("img") : null;
  if (!qrImg || !qrImg.src) {
    showToast("No QR code to print");
    return;
  }

  const bizName = state.settings.businessName || "DigitalQ";
  const urlInput = document.getElementById("qr-url-input");
  const qrUrl = urlInput ? urlInput.value.trim() : qrImg.src;
  const services = state.settings.services || [];
  const printWindow = window.open("", "_blank");
  printWindow.document
    .write(`<!DOCTYPE html><html><head><title>QR Code - ${bizName}</title>
        <style>body{font-family:Arial,sans-serif;text-align:center;padding:40px;}
        h1{font-size:28px;margin-bottom:8px;} p{color:#666;font-size:14px;margin-bottom:24px;}
        img{width:250px;height:250px;} .url{font-size:10px;color:#999;margin-top:16px;word-break:break-all;}
        .services{font-size:12px;color:#888;margin-top:8px;}
        @media print{body{padding:20px;}}</style></head>
        <body><h1>${bizName}</h1><p>Scan to join the queue</p>
        <img src="${qrImg.src}" alt="QR Code">
        <p class="services">Services: ${services.join(" &bull; ")}</p>
        <p class="url">${qrUrl}</p></body></html>`);
  printWindow.document.close();
  printWindow.onload = function () {
    printWindow.print();
  };
}

function downloadQRCode() {
  const container = document.getElementById("qr-code-container");
  const qrImg = container ? container.querySelector("img") : null;
  if (!qrImg || !qrImg.src) {
    showToast("No QR code to download");
    return;
  }

  const bizName = state.settings.businessName || "DigitalQ";
  const urlInput = document.getElementById("qr-url-input");
  const qrUrl = urlInput ? urlInput.value.trim() : "";
  const services = (state.settings.services || []).join("  \u2022  ");

  // Create a branded poster canvas
  const canvas = document.createElement("canvas");
  const w = 500,
    h = 650;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Header bar
  ctx.fillStyle = "#4f46e5";
  ctx.fillRect(0, 0, w, 80);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(bizName, w / 2, 52);

  // Subtitle
  ctx.fillStyle = "#64748b";
  ctx.font = "16px Arial, sans-serif";
  ctx.fillText("Scan to join the queue", w / 2, 115);

  // Draw QR image onto canvas
  const tempImg = new Image();
  tempImg.crossOrigin = "anonymous";
  tempImg.onload = function () {
    const qrSize = 250;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect((w - qrSize - 30) / 2, 130, qrSize + 30, qrSize + 30);
    ctx.drawImage(tempImg, (w - qrSize) / 2, 145, qrSize, qrSize);

    // Services
    if (services) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px Arial, sans-serif";
      ctx.fillText(services, w / 2, 430);
    }

    // URL
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText(qrUrl, w / 2, 460);

    // Footer
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, h - 40, w, 40);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px Arial, sans-serif";
    ctx.fillText("Powered by DigitalQ", w / 2, h - 15);

    // Download
    const link = document.createElement("a");
    link.download = bizName.replace(/[^a-zA-Z0-9]/g, "_") + "_QR.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("QR code downloaded!");
  };
  tempImg.onerror = function () {
    showToast("Failed to download. Try Print instead.");
  };
  tempImg.src = qrImg.src;
}

// --- Web Audio API Context ---
let audioCtx;
let audioEnabled = true;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playChime() {
  if (!audioEnabled) return;
  initAudio();
  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(660, now);
  gain1.gain.setValueAtTime(0.1, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 1.5);

  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(554.37, now + 0.4);
  gain2.gain.setValueAtTime(0.1, now + 0.4);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now + 0.4);
  osc2.stop(now + 2.5);
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  const btn = document.getElementById("audio-toggle");
  const icon = audioEnabled ? "volume-2" : "volume-x";
  const text = audioEnabled ? "Audio Alerts On" : "Audio Alerts Off";
  btn.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i><span>${text}</span>`;
  lucide.createIcons();
  if (audioEnabled) playChime();
}

// --- Logic ---
lucide.createIcons();
let timerInterval;
let lastTerminalOutcome = null;

// PRESETS CONFIG — each is an independent system
const PRESETS = {
  retail: {
    name: "City Mall Store",
    services: ["Sales", "Returns", "Click & Collect"],
  },
  hospital: {
    name: "General Hospital",
    services: ["Check-up", "Emergency", "Lab Test", "Pharmacy"],
  },
  bank: {
    name: "National Bank",
    services: ["Teller", "Loan Inquiry", "New Account", "Forex"],
  },
  tech: {
    name: "Tech Support",
    services: ["Hardware Fix", "Software Issue", "Warranty Claim"],
  },
};

// --- Per-system state ---
let activeSystemKey = localStorage.getItem("digitalq-system-key") || "default";
let currentSystemRef = null;

let state = {
  queue: [],
  currentTicket: null,
  lastTicketNumber: 0,
  stats: { totalServed: 0, totalWaitTime: 0 },
  settings: {
    businessName: "DigitalQ",
    services: ["Sales", "Support", "Inquiry"],
  },
};

function ensureStats() {
  if (!state.stats) state.stats = {};
  if (typeof state.stats.totalServed !== "number") state.stats.totalServed = 0;
  if (typeof state.stats.totalWaitTime !== "number")
    state.stats.totalWaitTime = 0;
}

// Switch active system — detach old listener, point to new Firebase path, reload
function switchSystem(systemKey) {
  if (stateListener && currentSystemRef) {
    currentSystemRef.off("value", stateListener);
    stateListener = null;
  }
  activeSystemKey = systemKey;
  localStorage.setItem("digitalq-system-key", systemKey);
  currentSystemRef = db.ref("systems/" + systemKey);

  // Reset local state with preset defaults if available
  const preset = PRESETS[systemKey];
  state = {
    queue: [],
    currentTicket: null,
    lastTicketNumber: 0,
    stats: { totalServed: 0, totalWaitTime: 0 },
    settings: {
      businessName: preset ? preset.name : "DigitalQ",
      services: preset ? [...preset.services] : ["Sales", "Support", "Inquiry"],
    },
  };
  loadState();
}

// Real-time listener for systems index (drives customer department picker)
let systemsIndexListener = null;

function listenSystemsIndex() {
  if (systemsIndexListener) return; // already listening
  systemsIndexListener = db.ref("systemsIndex").on("value", (snap) => {
    renderDepartmentPicker(snap.val() || {});
  });
}

// Save system info to index so department picker can discover it
function updateSystemsIndex() {
  db.ref("systemsIndex/" + activeSystemKey).set({
    name: state.settings.businessName,
    services: state.settings.services,
  });
}

let stateListener = null;

function loadState() {
  if (stateListener && currentSystemRef) {
    currentSystemRef.off("value", stateListener);
  }
  if (!currentSystemRef) {
    currentSystemRef = db.ref("systems/" + activeSystemKey);
  }

  stateListener = currentSystemRef.on("value", (snapshot) => {
    const saved = snapshot.val();
    if (saved) {
      state = { ...state, ...saved };

      if (!Array.isArray(state.queue)) {
        state.queue = state.queue ? Object.values(state.queue) : [];
      }
      state.queue = state.queue.filter((q) => q != null);

      state.queue.forEach((q) => {
        q.joinedAt = new Date(q.joinedAt);
        if (q.servedAt) q.servedAt = new Date(q.servedAt);
      });
      if (state.currentTicket) {
        state.currentTicket.joinedAt = new Date(state.currentTicket.joinedAt);
        if (state.currentTicket.servedAt)
          state.currentTicket.servedAt = new Date(state.currentTicket.servedAt);
      }
    }
    ensureStats();
    render();
    renderCustomerJoin();
  });
}

function saveState() {
  ensureStats();
  if (!currentSystemRef) {
    currentSystemRef = db.ref("systems/" + activeSystemKey);
  }
  const payload = JSON.parse(JSON.stringify(state));
  currentSystemRef.set(payload).catch((error) => {
    console.error("Failed to save state to Firebase:", error);
    showToast("Error saving data. Check your connection.");
  });
  updateSystemsIndex();
  render();
}

function switchView(view) {
  document.getElementById("view-customer").classList.add("hidden");
  document.getElementById("view-staff").classList.add("hidden");

  const inactive =
    "px-5 py-2 rounded-lg text-sm font-semibold transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white";
  const active =
    "px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300";

  document.getElementById("btn-customer").className = inactive;
  document.getElementById("btn-staff").className = inactive;

  if (view === "customer") {
    document.getElementById("view-customer").classList.remove("hidden");
    document.getElementById("btn-customer").className = active;
    renderCustomerJoin(); // Ensure buttons are up to date
  } else {
    document.getElementById("view-staff").classList.remove("hidden");
    document.getElementById("btn-staff").className = active;
    // Staff Login Check is handled by the overlay visibility
  }
  render();
}

// --- STAFF LOGIN LOGIC ---
let selectedLoginSystem =
  localStorage.getItem("digitalq-system-key") || "default";

function selectLoginSystem(key) {
  selectedLoginSystem = key;
  document.querySelectorAll(".sys-sel-btn").forEach((b) => {
    b.classList.remove("border-indigo-500", "bg-indigo-50", "text-indigo-700");
    b.classList.add("border-slate-200", "text-slate-600");
  });
  const btn = document.getElementById("sys-btn-" + key);
  if (btn) {
    btn.classList.remove("border-slate-200", "text-slate-600");
    btn.classList.add("border-indigo-500", "bg-indigo-50", "text-indigo-700");
  }
}

function checkStaffLogin() {
  const staffPinInput = document.getElementById("staff-pin");
  if (!staffPinInput) return;

  const pin = staffPinInput.value;
  if (pin === "1234") {
    const screen = document.getElementById("staff-login-screen");
    if (screen) {
      screen.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => screen.classList.add("hidden"), 500);
    }
    // Switch to selected system
    switchSystem(selectedLoginSystem);
  } else {
    const input = document.getElementById("staff-pin");
    if (input) {
      input.classList.add("animate-shake", "border-red-500", "text-red-500");
      setTimeout(
        () =>
          input.classList.remove(
            "animate-shake",
            "border-red-500",
            "text-red-500",
          ),
        500,
      );
      input.value = "";
    }
  }
}

// --- SETTINGS LOGIC ---
function openSettingsModal() {
  const settingsModal = document.getElementById("settings-modal");
  const settingBizName = document.getElementById("setting-biz-name");
  const settingServices = document.getElementById("setting-services");

  if (settingsModal) settingsModal.classList.remove("hidden");
  if (settingBizName) settingBizName.value = state.settings.businessName;
  if (settingServices)
    settingServices.value = state.settings.services.join(", ");
}
function closeSettingsModal() {
  const settingsModal = document.getElementById("settings-modal");
  if (settingsModal) settingsModal.classList.add("hidden");
}
function loadPreset(type) {
  const p = PRESETS[type];
  if (!p) return;

  const settingBizName = document.getElementById("setting-biz-name");
  const settingServices = document.getElementById("setting-services");

  if (settingBizName) settingBizName.value = p.name;
  if (settingServices) settingServices.value = p.services.join(", ");

  // Store which preset key to switch to on save
  document.getElementById("settings-modal").dataset.presetKey = type;
}
function saveSettings() {
  const nameInput = document.getElementById("setting-biz-name");
  const servicesInput = document.getElementById("setting-services");

  if (!nameInput || !servicesInput) return;

  const name = nameInput.value.trim();
  const rawServices = servicesInput.value;
  const services = rawServices
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!name || services.length === 0) {
    alert("Please provide valid business details");
    return;
  }

  // Check if a preset was loaded — switch system to that preset key
  const modal = document.getElementById("settings-modal");
  const presetKey = modal.dataset.presetKey || null;

  if (presetKey && presetKey !== activeSystemKey) {
    // Switch to the new system, then apply settings
    switchSystem(presetKey);
    // Wait for loadState to fire, then update settings
    setTimeout(() => {
      state.settings = { businessName: name, services: services };
      saveState();
      closeSettingsModal();
      renderCustomerJoin();
      showToast("Switched to " + name);
    }, 500);
  } else {
    state.settings = { businessName: name, services: services };
    saveState();
    closeSettingsModal();
    renderCustomerJoin();
    showToast("System Configuration Updated");
  }
  // Clear preset key
  delete modal.dataset.presetKey;
}

// --- CUSTOMER LOGIC ---
let myTicketId = null;

function renderCustomerJoin() {
  const container = document.getElementById("service-options-container");
  if (!container) return;

  container.innerHTML = "";

  const welcomeTitle = document.getElementById("cust-welcome-title");
  const navBizName = document.getElementById("nav-business-name");
  if (welcomeTitle) welcomeTitle.textContent = state.settings.businessName;
  if (navBizName) navBizName.textContent = state.settings.businessName;

  state.settings.services.forEach((svc) => {
    const btn = document.createElement("button");
    btn.className =
      "service-opt p-4 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 text-left transition-all group relative overflow-hidden";
    btn.onclick = () => selectService(svc, btn);

    const bgOverlay = document.createElement("div");
    bgOverlay.className =
      "absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity";

    const contentDiv = document.createElement("div");
    contentDiv.className = "relative z-10 flex items-center justify-between";

    const textSpan = document.createElement("span");
    textSpan.className = "text-sm font-bold text-slate-800 dark:text-slate-200";
    textSpan.textContent = svc;

    const iconDiv = document.createElement("div");
    iconDiv.className =
      "w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors";
    iconDiv.innerHTML = `<i data-lucide="chevron-right" class="w-4 h-4"></i>`;

    contentDiv.appendChild(textSpan);
    contentDiv.appendChild(iconDiv);
    btn.appendChild(bgOverlay);
    btn.appendChild(contentDiv);
    container.appendChild(btn);
  });
  lucide.createIcons();
}

function selectService(type, btnElement) {
  document.getElementById("cust-service").value = type;
  document.querySelectorAll(".service-opt").forEach((b) => {
    b.classList.remove(
      "ring-2",
      "ring-indigo-500",
      "bg-indigo-50",
      "dark:bg-indigo-900/30",
    );
    b.classList.add("bg-white", "dark:bg-slate-700");
  });
  btnElement.classList.remove("bg-white", "dark:bg-slate-700");
  btnElement.classList.add(
    "ring-2",
    "ring-indigo-500",
    "bg-indigo-50",
    "dark:bg-indigo-900/30",
  );
}

// --- Customer Department Picker ---
const deptStyles = {
  retail: {
    icon: "shopping-bag",
    gradient: "from-orange-400 to-pink-500",
    shadow: "shadow-orange-500/25",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "hover:border-orange-300",
  },
  hospital: {
    icon: "heart-pulse",
    gradient: "from-rose-400 to-red-500",
    shadow: "shadow-rose-500/25",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "hover:border-rose-300",
  },
  bank: {
    icon: "landmark",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/25",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "hover:border-emerald-300",
  },
  tech: {
    icon: "monitor",
    gradient: "from-blue-400 to-indigo-500",
    shadow: "shadow-blue-500/25",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "hover:border-blue-300",
  },
};
const defaultStyle = {
  icon: "layers",
  gradient: "from-slate-400 to-slate-500",
  shadow: "shadow-slate-500/25",
  bg: "bg-slate-50 dark:bg-slate-800",
  border: "hover:border-slate-300",
};

function renderDepartmentPicker(liveIndex) {
  const container = document.getElementById("dept-picker-container");
  if (!container) return;
  container.innerHTML = "";

  // Merge presets with live Firebase data — live data overrides names/services
  const allKeys = new Set([
    ...Object.keys(PRESETS),
    ...Object.keys(liveIndex || {}),
  ]);

  allKeys.forEach((key) => {
    const live = liveIndex && liveIndex[key]; // { name, services } or old string or null
    const preset = PRESETS[key];
    const s = deptStyles[key] || defaultStyle;

    // Determine display name and services from live data (Firebase) first, preset as fallback
    let displayName, displayServices;
    if (live && typeof live === "object") {
      displayName = live.name || (preset ? preset.name : key);
      displayServices = Array.isArray(live.services)
        ? live.services
        : preset
          ? preset.services
          : [];
    } else if (live && typeof live === "string") {
      // Legacy: index stored just the name string
      displayName = live;
      displayServices = preset ? preset.services : [];
    } else {
      displayName = preset ? preset.name : key;
      displayServices = preset ? preset.services : [];
    }

    const btn = document.createElement("button");
    btn.className = `dept-btn flex flex-col items-center p-5 border-2 border-slate-100 dark:border-slate-700 ${s.bg} rounded-3xl ${s.border} hover:shadow-xl hover:-translate-y-1 text-center transition-all duration-300 group`;
    btn.onclick = () => selectDepartment(key);

    const iconWrap = document.createElement("div");
    iconWrap.className = `w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} ${s.shadow} shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`;
    iconWrap.innerHTML =
      '<i data-lucide="' + s.icon + '" class="w-6 h-6 text-white"></i>';

    const nameEl = document.createElement("div");
    nameEl.className =
      "font-bold text-sm text-slate-800 dark:text-slate-200 mb-1 leading-tight";
    nameEl.textContent = displayName;

    const svcEl = document.createElement("div");
    svcEl.className =
      "text-[10px] text-slate-400 dark:text-slate-500 leading-snug";
    svcEl.textContent = displayServices.length + " services";

    btn.appendChild(iconWrap);
    btn.appendChild(nameEl);
    btn.appendChild(svcEl);
    container.appendChild(btn);
  });

  lucide.createIcons();
}

function selectDepartment(systemKey) {
  switchSystem(systemKey);
  // Hide department picker, show join form
  const picker = document.getElementById("customer-dept-picker");
  const join = document.getElementById("customer-join");
  if (picker) picker.classList.add("hidden");
  if (join) join.classList.remove("hidden");
  renderCustomerJoin();
}

function backToDeptPicker() {
  const picker = document.getElementById("customer-dept-picker");
  const join = document.getElementById("customer-join");
  if (picker) picker.classList.remove("hidden");
  if (join) join.classList.add("hidden");
}

function joinQueue() {
  const name = document.getElementById("cust-name").value.trim();
  const service = document.getElementById("cust-service").value.trim();

  if (!name || !service) {
    showToast("Please enter your name & select service");
    return;
  }

  initAudio();

  state.lastTicketNumber++;
  const ticketLetter = service.charAt(0).toUpperCase();
  const ticketNum = `${ticketLetter}-${String(state.lastTicketNumber).padStart(3, "0")}`;

  const newEntry = {
    id: Date.now().toString(),
    ticket: ticketNum,
    name: name,
    service: service,
    status: "waiting",
    joinedAt: new Date(),
    counter: null,
  };

  state.queue.push(newEntry);
  myTicketId = newEntry.id;
  saveState();

  document.getElementById("customer-join").classList.add("hidden");
  document.getElementById("customer-ticket").classList.remove("hidden");

  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateMyTimer, 1000);
}

function updateMyTimer() {
  if (!myTicketId) return;
  const myEntry = state.queue.find((q) => q.id === myTicketId);
  if (myEntry && myEntry.status === "waiting") {
    const diff = Math.floor((new Date() - new Date(myEntry.joinedAt)) / 1000);
    const mins = Math.floor(diff / 60)
      .toString()
      .padStart(2, "0");
    const secs = (diff % 60).toString().padStart(2, "0");
    document.getElementById("wait-timer").innerText = `Waited: ${mins}:${secs}`;
  } else {
    document.getElementById("wait-timer").innerText = "";
  }
}

function leaveQueue() {
  // Always clear timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (myTicketId) {
    state.queue = state.queue.filter((q) => q.id !== myTicketId);
    myTicketId = null;
    previousStatus = null;
    lastTerminalOutcome = null;
    saveState();
  }

  const nameInput = document.getElementById("cust-name");
  if (nameInput) nameInput.value = "";
  const custService = document.getElementById("cust-service");
  if (custService) custService.value = "";

  document.querySelectorAll(".service-opt").forEach((b) => {
    b.classList.remove(
      "ring-2",
      "ring-indigo-500",
      "bg-indigo-50",
      "dark:bg-indigo-900/30",
    );
    b.classList.add("bg-white", "dark:bg-slate-700");
  });

  const joinView = document.getElementById("customer-join");
  const ticketView = document.getElementById("customer-ticket");
  if (joinView) joinView.classList.remove("hidden");
  if (ticketView) ticketView.classList.add("hidden");
}

function showCompletedScreen(outcome = "completed") {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Clear ticket so this doesn't re-fire on every render cycle
  myTicketId = null;
  previousStatus = null;
  lastTerminalOutcome = outcome;

  const customerJoinView = document.getElementById("customer-join");
  const customerTicketView = document.getElementById("customer-ticket");
  if (customerJoinView) customerJoinView.classList.add("hidden");
  if (customerTicketView) customerTicketView.classList.remove("hidden");

  const header = document.getElementById("ticket-header");
  const statusTxt = document.getElementById("ticket-status-text");
  const waitingPanel = document.getElementById("waiting-info-panel");
  const servingPanel = document.getElementById("serving-info-panel");
  const completedPanel = document.getElementById("completed-info-panel");
  const btnLeave = document.getElementById("btn-leave-queue");
  const btnBack = document.getElementById("btn-back-to-join");
  const completedIcon = completedPanel
    ? completedPanel.querySelector("i[data-lucide]")
    : null;
  const completedTitle = completedPanel
    ? completedPanel.querySelector("div.text-lg")
    : null;
  const completedMessage = completedPanel
    ? completedPanel.querySelector("p")
    : null;

  const isDeclined = outcome === "declined";
  if (header)
    header.className = isDeclined
      ? "bg-red-600 p-8 text-center relative overflow-hidden transition-colors duration-500"
      : "bg-emerald-600 p-8 text-center relative overflow-hidden transition-colors duration-500";
  if (statusTxt) statusTxt.textContent = isDeclined ? "Declined" : "Completed";
  if (completedPanel)
    completedPanel.className = isDeclined
      ? "text-center mb-8 animate-pop"
      : "text-center mb-8 animate-pop";
  if (completedIcon)
    completedIcon.setAttribute(
      "data-lucide",
      isDeclined ? "x-circle" : "check-circle",
    );
  if (completedTitle)
    completedTitle.textContent = isDeclined
      ? "Service Declined"
      : "Service Completed";
  if (completedMessage)
    completedMessage.textContent = isDeclined
      ? "This request was declined by staff."
      : "Thank you for visiting!";
  if (waitingPanel) waitingPanel.classList.add("hidden");
  if (servingPanel) servingPanel.classList.add("hidden");
  if (completedPanel) completedPanel.classList.remove("hidden");
  if (btnLeave) btnLeave.classList.add("hidden");
  if (btnBack) btnBack.classList.remove("hidden");

  const waitTimer = document.getElementById("wait-timer");
  if (waitTimer) waitTimer.innerText = "";

  playChime();
  lucide.createIcons();
}

function backToJoin() {
  myTicketId = null;
  previousStatus = null;
  lastTerminalOutcome = null;

  const completedPanel = document.getElementById("completed-info-panel");
  const btnLeave = document.getElementById("btn-leave-queue");
  const btnBack = document.getElementById("btn-back-to-join");
  if (completedPanel) completedPanel.classList.add("hidden");
  if (btnLeave) btnLeave.classList.remove("hidden");
  if (btnBack) btnBack.classList.add("hidden");

  const nameInput = document.getElementById("cust-name");
  if (nameInput) nameInput.value = "";
  const custService = document.getElementById("cust-service");
  if (custService) custService.value = "";

  document.querySelectorAll(".service-opt").forEach((b) => {
    b.classList.remove(
      "ring-2",
      "ring-indigo-500",
      "bg-indigo-50",
      "dark:bg-indigo-900/30",
    );
    b.classList.add("bg-white", "dark:bg-slate-700");
  });

  const joinView = document.getElementById("customer-join");
  const ticketView = document.getElementById("customer-ticket");
  if (joinView) joinView.classList.remove("hidden");
  if (ticketView) ticketView.classList.add("hidden");
}

// --- STAFF LOGIC ---
function callNext() {
  // Complete previous ticket if any (without saving yet to avoid double write)
  if (state.currentTicket) {
    const oldIdx = state.queue.findIndex(
      (q) => q.id === state.currentTicket.id,
    );
    if (oldIdx !== -1 && state.queue[oldIdx].status === "serving") {
      const item = state.queue[oldIdx];
      if (!item.servedAt) item.servedAt = new Date();
      state.stats.totalServed++;
      const waitMins =
        (new Date(item.servedAt) - new Date(item.joinedAt)) / 60000;
      if (!isNaN(waitMins) && waitMins > 0)
        state.stats.totalWaitTime += waitMins;
      item.status = "completed";
      item.completedAt = new Date();
      state.currentTicket = null;
    }
  }

  // Find next waiting customer AFTER completing previous
  const nextIdx = state.queue.findIndex((q) => q.status === "waiting");
  if (nextIdx === -1) {
    saveState();
    showToast("Queue is empty!");
    return;
  }

  const counterNum = Math.ceil(Math.random() * 3);
  state.queue[nextIdx].status = "serving";
  state.queue[nextIdx].counter = counterNum;
  state.queue[nextIdx].servedAt = new Date();
  state.currentTicket = state.queue[nextIdx];
  saveState();
  showToast(`Calling ${state.currentTicket.ticket}`);
}

function completeCurrent() {
  if (!state.currentTicket) return;
  const idx = state.queue.findIndex((q) => q.id === state.currentTicket.id);
  if (idx !== -1) {
    const item = state.queue[idx];
    if (!item.servedAt) item.servedAt = new Date();
    // Increment served count and accumulate wait time
    state.stats.totalServed++;
    const waitMins =
      (new Date(item.servedAt) - new Date(item.joinedAt)) / 60000;
    if (!isNaN(waitMins) && waitMins > 0) state.stats.totalWaitTime += waitMins;
    // Mark as completed first so customer app can show completion state
    item.status = "completed";
    item.completedAt = new Date();
    state.currentTicket = null;
    saveState();
    showToast("Ticket Completed");
  }
}

function markDeclined() {
  if (!state.currentTicket) return;
  const idx = state.queue.findIndex((q) => q.id === state.currentTicket.id);
  if (idx !== -1) {
    const item = state.queue[idx];
    item.status = "declined";
    item.declinedAt = new Date();
    state.currentTicket = null;
    saveState();
    showToast("Marked Declined");
  }
}

// Priority select: staff can pick any waiting customer to serve next
function callSpecific(ticketId) {
  // Complete previous ticket if any
  if (state.currentTicket) {
    const oldIdx = state.queue.findIndex(
      (q) => q.id === state.currentTicket.id,
    );
    if (oldIdx !== -1 && state.queue[oldIdx].status === "serving") {
      const item = state.queue[oldIdx];
      if (!item.servedAt) item.servedAt = new Date();
      state.stats.totalServed++;
      const waitMins =
        (new Date(item.servedAt) - new Date(item.joinedAt)) / 60000;
      if (!isNaN(waitMins) && waitMins > 0)
        state.stats.totalWaitTime += waitMins;
      item.status = "completed";
      item.completedAt = new Date();
      state.currentTicket = null;
    }
  }

  const idx = state.queue.findIndex(
    (q) => q.id === ticketId && q.status === "waiting",
  );
  if (idx === -1) {
    showToast("Customer not found or already serving");
    return;
  }

  const counterNum = Math.ceil(Math.random() * 3);
  state.queue[idx].status = "serving";
  state.queue[idx].counter = counterNum;
  state.queue[idx].servedAt = new Date();
  state.currentTicket = state.queue[idx];
  saveState();
  showToast(`Priority: Calling ${state.currentTicket.ticket}`);
}

function resetSystem() {
  if (
    confirm(
      "Reset this system's data? (Queue & stats for " +
        state.settings.businessName +
        ")",
    )
  ) {
    const savedSettings = state.settings;
    state = {
      queue: [],
      currentTicket: null,
      lastTicketNumber: 0,
      stats: { totalServed: 0, totalWaitTime: 0 },
      settings: savedSettings,
    };
    saveState();
    location.reload();
  }
}

// --- RENDER ---
let previousStatus = null;
function render() {
  try {
    // Update Headers
    const navBiz = document.getElementById("nav-business-name");
    if (navBiz) navBiz.textContent = state.settings.businessName;

    const staffBiz = document.getElementById("staff-business-label");
    if (staffBiz) staffBiz.textContent = state.settings.businessName;

    // Customer View
    if (myTicketId) {
      const myEntry = state.queue.find((q) => q.id === myTicketId);

      // Ticket was removed (legacy/reset scenario)
      if (!myEntry) {
        showCompletedScreen(lastTerminalOutcome || "completed");
      } else {
        const ticketNumDisplay = document.getElementById(
          "ticket-number-display",
        );
        const ticketServiceDisplay = document.getElementById(
          "ticket-service-display",
        );
        const ticketBizDisplay = document.getElementById(
          "ticket-business-display",
        );

        if (ticketNumDisplay) ticketNumDisplay.textContent = myEntry.ticket;
        if (ticketServiceDisplay)
          ticketServiceDisplay.textContent = myEntry.service;
        if (ticketBizDisplay)
          ticketBizDisplay.textContent = state.settings.businessName;

        const header = document.getElementById("ticket-header");
        const statusTxt = document.getElementById("ticket-status-text");
        const waitingPanel = document.getElementById("waiting-info-panel");
        const servingPanel = document.getElementById("serving-info-panel");

        if (previousStatus === "waiting" && myEntry.status === "serving") {
          playChime();
          if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        }
        previousStatus = myEntry.status;

        // Ensure completed panel is hidden when in active states
        const completedPanel = document.getElementById("completed-info-panel");
        if (completedPanel) completedPanel.classList.add("hidden");

        if (myEntry.status === "waiting") {
          header.className =
            "bg-indigo-600 p-8 text-center relative overflow-hidden transition-colors duration-500";
          statusTxt.textContent = "In Queue";
          statusTxt.parentElement.className =
            "inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4 border border-white/10";

          const ahead = state.queue.filter(
            (q) => q.status === "waiting" && q.id < myTicketId,
          ).length;
          const peopleAhead = document.getElementById("people-ahead");
          const estWait = document.getElementById("est-wait");
          if (peopleAhead) peopleAhead.textContent = ahead;
          if (estWait) estWait.textContent = ahead * 5 + 5 + "m";

          if (waitingPanel) waitingPanel.classList.remove("hidden");
          if (servingPanel) servingPanel.classList.add("hidden");
        } else if (myEntry.status === "serving") {
          header.className =
            "bg-emerald-500 p-8 text-center relative overflow-hidden transition-colors duration-500";
          statusTxt.textContent = "It's Your Turn!";
          statusTxt.parentElement.className =
            "inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold text-white mb-4 border border-white/10 animate-bounce";

          const assignedCounter = document.getElementById("assigned-counter");
          if (assignedCounter)
            assignedCounter.textContent = myEntry.counter || 1;

          if (waitingPanel) waitingPanel.classList.add("hidden");
          if (servingPanel) servingPanel.classList.remove("hidden");
        } else if (myEntry.status === "completed") {
          lastTerminalOutcome = "completed";
          showCompletedScreen();
        } else if (myEntry.status === "declined") {
          lastTerminalOutcome = "declined";
          showCompletedScreen("declined");
        }
      } // end else (myEntry exists)
    }

    // Staff Stats
    const waitingCount = state.queue.filter(
      (q) => q.status === "waiting",
    ).length;
    const avgWait =
      state.stats.totalServed > 0
        ? Math.round(state.stats.totalWaitTime / state.stats.totalServed) + "m"
        : "--";

    const staffWaitingCount = document.getElementById("staff-waiting-count");
    const staffServedCount = document.getElementById("staff-served-count");
    const staffSystemLabel = document.getElementById("staff-system-label");
    if (staffWaitingCount) staffWaitingCount.textContent = waitingCount;
    if (staffServedCount)
      staffServedCount.textContent = state.stats.totalServed;
    if (staffSystemLabel)
      staffSystemLabel.textContent =
        activeSystemKey.charAt(0).toUpperCase() + activeSystemKey.slice(1);

    // Staff Current
    if (state.currentTicket) {
      const staffCurrentTicket = document.getElementById(
        "staff-current-ticket",
      );
      const staffCurrentName = document.getElementById("staff-current-name");
      const staffCurrentService = document.getElementById(
        "staff-current-service",
      );
      const staffCounterDisplay = document.getElementById(
        "staff-counter-display",
      );
      const staffCurrentCounterNum = document.getElementById(
        "staff-current-counter-num",
      );

      if (staffCurrentTicket)
        staffCurrentTicket.textContent = state.currentTicket.ticket;
      if (staffCurrentName)
        staffCurrentName.textContent = state.currentTicket.name;
      if (staffCurrentService)
        staffCurrentService.textContent = state.currentTicket.service;
      if (staffCounterDisplay) staffCounterDisplay.classList.remove("hidden");
      if (staffCurrentCounterNum)
        staffCurrentCounterNum.textContent = state.currentTicket.counter;
    } else {
      const staffCurrentTicket = document.getElementById(
        "staff-current-ticket",
      );
      const staffCurrentName = document.getElementById("staff-current-name");
      const staffCurrentService = document.getElementById(
        "staff-current-service",
      );
      const staffCounterDisplay = document.getElementById(
        "staff-counter-display",
      );

      if (staffCurrentTicket) staffCurrentTicket.textContent = "--";
      if (staffCurrentName) staffCurrentName.textContent = "No Active Ticket";
      if (staffCurrentService)
        staffCurrentService.textContent = "Ready to serve";
      if (staffCounterDisplay) staffCounterDisplay.classList.add("hidden");
    }

    // Staff List
    const queueList = document.getElementById("staff-queue-list");
    if (queueList) {
      queueList.innerHTML = "";
      const relevant = state.queue
        .filter((q) => ["waiting", "serving"].includes(q.status))
        .sort((a, b) => {
          if (a.status === "serving" && b.status !== "serving") return -1;
          if (b.status === "serving" && a.status !== "serving") return 1;
          return new Date(a.joinedAt) - new Date(b.joinedAt);
        });

      if (relevant.length === 0) {
        queueList.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm italic">Queue is currently empty.</div>`;
      } else {
        relevant.forEach((q) => {
          const isServing = q.status === "serving";
          const diffSec = Math.floor(
            (new Date() - new Date(q.joinedAt)) / 1000,
          );
          const mins = Math.floor(diffSec / 60);
          const secs = diffSec % 60;
          const timeStr =
            mins > 0
              ? mins + "m " + String(secs).padStart(2, "0") + "s"
              : secs + "s";

          // Create elements safely without XSS vulnerability
          const itemDiv = document.createElement("div");
          itemDiv.className = `flex items-center p-3 rounded-xl border ${isServing ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-inner" : "bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 hover:border-slate-300"} transition-all`;

          const ticketDiv = document.createElement("div");
          ticketDiv.className = `w-24 font-mono font-bold text-lg ${isServing ? "text-indigo-600" : "text-slate-600"}`;
          ticketDiv.textContent = q.ticket;

          const detailsDiv = document.createElement("div");
          detailsDiv.className = "flex-1 min-w-0";
          const nameDiv = document.createElement("div");
          nameDiv.className =
            "text-sm font-bold text-slate-800 dark:text-slate-200 truncate";
          nameDiv.textContent = q.name;
          const serviceDiv = document.createElement("div");
          serviceDiv.className =
            "text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5";
          serviceDiv.textContent = q.service + " • " + timeStr + " wait";
          detailsDiv.appendChild(nameDiv);
          detailsDiv.appendChild(serviceDiv);

          const statusDiv = document.createElement("div");
          statusDiv.className =
            "w-32 text-right flex items-center justify-end gap-2";
          const statusSpan = document.createElement("span");
          if (isServing) {
            statusSpan.className =
              "inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold";
            statusSpan.innerHTML = `<i data-lucide="mic" class="w-3 h-3"></i> Counter ${q.counter}`;
          } else {
            // Priority call button for waiting customers
            const callBtn = document.createElement("button");
            callBtn.className =
              "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md text-xs font-bold transition-colors";
            callBtn.textContent = "Call";
            callBtn.title = "Priority: Call this customer next";
            callBtn.onclick = (e) => {
              e.stopPropagation();
              callSpecific(q.id);
            };
            statusDiv.appendChild(callBtn);

            statusSpan.className =
              "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-md text-xs font-medium";
            statusSpan.textContent = "Waiting";
          }
          statusDiv.appendChild(statusSpan);

          itemDiv.appendChild(ticketDiv);
          itemDiv.appendChild(detailsDiv);
          itemDiv.appendChild(statusDiv);
          queueList.appendChild(itemDiv);
        });
      }
      lucide.createIcons();
    }
  } catch (error) {
    console.error("Render error:", error);
  }
}

function showToast(msg) {
  const el = document.getElementById("toast");
  const toastMsg = document.getElementById("toast-msg");
  if (el && toastMsg) {
    toastMsg.textContent = msg;
    el.classList.remove("translate-y-24");
    setTimeout(() => el.classList.add("translate-y-24"), 3000);
  }
}

// Animate logo swap from "Q-Flow" to "DigitalQ" shortly after load
(function swapLogoText() {
  const logo = document.getElementById("logo-text");
  if (!logo) return;
  setTimeout(() => {
    logo.style.transition = "opacity 300ms";
    logo.style.opacity = "0";
    setTimeout(() => {
      logo.innerHTML =
        'Digital<span class="text-indigo-600 dark:text-indigo-400">Q</span>';
      document.title = document.title.replace("Q-Flow", "DigitalQ");
      if (window.state && state.settings)
        state.settings.businessName = state.settings.businessName.replace(
          "Q-Flow",
          "DigitalQ",
        );
      logo.style.opacity = "1";
      render();
    }, 350);
  }, 1200);
})();

loadState();
switchView("customer");

// Start real-time listener for department picker (auto-updates when staff changes config)
listenSystemsIndex();
// Also render with preset defaults immediately (before Firebase responds)
renderDepartmentPicker({});

// Refresh staff queue wait times every second
let staffTimerInterval = setInterval(function () {
  const staffView = document.getElementById("view-staff");
  if (staffView && !staffView.classList.contains("hidden")) {
    render();
  }
}, 1000);
