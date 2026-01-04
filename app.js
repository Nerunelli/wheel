const LS_KEY = "fortune_drum_options_v1";
const VIEW_KEY = "fortune_drum_compact_v1";

const drumEl = document.getElementById("drum");
const listEl = document.getElementById("list");
const resultEl = document.getElementById("result");

const textEl = document.getElementById("text");
const emojiEl = document.getElementById("emoji");
const badgeEl = document.getElementById("badge");

const addBtn = document.getElementById("add");
const resetBtn = document.getElementById("reset");
const spinBtn = document.getElementById("spin");
const toggleViewBtn = document.getElementById("toggleView");

const winCardEl = document.getElementById("winCard");
const winIconEl = document.getElementById("winIcon");
const winBadgeEl = document.getElementById("winBadge");
const winTitleEl = document.getElementById("winTitle");
const winDescEl = document.getElementById("winDesc");
const winLinkEl = document.getElementById("winLink");

const spinMoreBtn = document.getElementById("spinMore");
const winOkBtn = document.getElementById("winOk");

let options = loadOptions();
let spinning = false;
let cardMetrics = []; // { el, centerLocal, h }


// пастельная палитра (как в банках)
const PASTELS = [
  "#D7E6D4", // мятный
  "#DCCFEA", // сиреневый
  "#CFE4E3", // голубовато-зеленый
  "#E7D6C6", // бежево-розовый
  "#D9D9C7", // теплый песочный
];

// дефолтные варианты
if (options.length === 0) {
  options = [
    { text: "Цветы", emoji: "🌿", badge: "3%" },
    { text: "Рождество с Афишей", emoji: "🎁", badge: "10%" },
    { text: "Ювелирные изделия", emoji: "💎", badge: "5%" },
    { text: "Вау-кэшбэк", emoji: "🎯", badge: "до 5 000 ₽" },
    { text: "Образование", emoji: "🎓", badge: "3%" },
  ];
  saveOptions();
}

renderAll();

winOkBtn.addEventListener("click", () => {
  winCardEl.hidden = true;
  document.body.classList.remove("modalOpen");
});

/* -------- режим скрытия настроек -------- */

const savedCompact = localStorage.getItem(VIEW_KEY) === "1";
setCompact(savedCompact);

toggleViewBtn.addEventListener("click", () => {
  const isCompact = document.body.classList.toggle("compact");
  localStorage.setItem(VIEW_KEY, isCompact ? "1" : "0");
  updateToggleButton(isCompact);
});

function setCompact(isCompact){
  document.body.classList.toggle("compact", isCompact);
  updateToggleButton(isCompact);
}

function updateToggleButton(isCompact){
  const label = isCompact ? "Показать настройки" : "Скрыть настройки";
  toggleViewBtn.setAttribute("aria-label", label);
  toggleViewBtn.setAttribute("title", label);
}

/* -------- добавление / удаление -------- */

addBtn.addEventListener("click", () => {
  const text = textEl.value.trim();
  const emoji = (emojiEl.value.trim() || "✨").slice(0, 4);
  const badge = badgeEl.value.trim();

  if (!text) return;

  options.unshift({ text, emoji, badge });
  saveOptions();
  textEl.value = "";
  emojiEl.value = "";
  badgeEl.value = "";
  renderAll();
});

resetBtn.addEventListener("click", () => {
  options = [];
  saveOptions();
  renderAll();
});


/* -------- вращение -------- */

spinBtn.addEventListener("click", async () => {
  if (spinning) return;
  if (options.length < 2) {
    resultEl.textContent = "Добавь хотя бы 2 варианта 🙂";
    return;
  }

  spinning = true;
  document.body.classList.add("spinning");
  resultEl.textContent = "";

  const loopCount = 30;
  const tailLoops = 6;

  // делаем ленту из КОПИЙ, чтобы хранить исходный индекс (для пастельных цветов)
  const tape = [];
  for (let i = 0; i < loopCount; i++) {
    for (let oi = 0; oi < options.length; oi++) {
      const o = options[oi];
      tape.push({ ...o, __oi: oi });
    }
  }

  const winnerIndex = randInt(0, options.length - 1);
  const base = (loopCount - tailLoops) * options.length;
  const finalIndex = base + winnerIndex;

  renderDrum(tape);
  await new Promise(requestAnimationFrame);
  buildCardMetrics();


  // начальный “3D” эффект
  applyDepthEffectFast();

  const cardEls = drumEl.querySelectorAll(".card");
  const windowH = document.querySelector(".drumWindow").getBoundingClientRect().height;
  const centerLine = windowH / 2;

  const targetCard = cardEls[finalIndex];
  const cardCenter = targetCard.offsetTop + targetCard.offsetHeight / 2;
  const targetY = centerLine - cardCenter;

  const firstCenter = cardEls[0].offsetTop + cardEls[0].offsetHeight / 2;
  const startY = centerLine - firstCenter;

  drumEl.style.transition = "none";
  drumEl.style.transform = `translateY(${startY}px)`;
  drumEl.getBoundingClientRect();

  // длительность та же, “импульс” мягче
  const duration = 2600 + randInt(0, 800);
drumEl.style.transition = `transform ${duration}ms cubic-bezier(.12,.12,.12,1)`;
  drumEl.style.transform = `translateY(${targetY}px)`;

  // во время анимации — обновляем прозрачность/ширину (scaleX)
  const t0 = performance.now();
  let rafId = 0;

  const tick = () => {
  applyDepthEffectFast();
  queueMicrotask(applyDepthEffectFast);

  if (performance.now() - t0 < duration + 60) {
    rafId = requestAnimationFrame(tick);
  }
};

  rafId = requestAnimationFrame(tick);

  await wait(duration);
  cancelAnimationFrame(rafId);

  // финальный апдейт, чтобы точно “встало”
  applyDepthEffectFast();

  cardEls.forEach(el => el.classList.remove("highlight"));
  targetCard.classList.add("highlight");

  const w = options[winnerIndex];
  resultEl.textContent = `Выпало: ${w.badge ? w.badge + " — " : ""}${w.text}`;
  setTimeout(() => {
  showWinCard(w);
}, 800);
document.body.classList.remove("spinning");
  spinning = false;
});

/* -------- “глубина”: ширина + прозрачность по расстоянию от центра -------- */

function applyDepthEffect(){
  const windowEl = document.querySelector(".drumWindow");
  const wRect = windowEl.getBoundingClientRect();
  const centerY = wRect.top + wRect.height / 2;
  const maxD = wRect.height / 2;

  const cards = drumEl.querySelectorAll(".card");
  cards.forEach((card) => {
    const r = card.getBoundingClientRect();
    const cY = r.top + r.height / 2;
    const d = Math.abs(cY - centerY);
    const t = clamp(d / maxD, 0, 1);

    // чем дальше от центра, тем уже и прозрачнее (как “дальше от пользователя”)
    const scaleX = 1 - 0.28 * t;  // было 0.14
const scaleY = 1 - 0.17 * t;  // чуть сильнее
const opacity = 1 - 0.70 * t; // сильнее “даль”

    card.style.transform = `scale(${scaleX}, ${scaleY})`;
    card.style.opacity = String(opacity);
  });
}

function clamp(x, a, b){
  return Math.max(a, Math.min(b, x));
}

/* -------- рендер -------- */

function renderAll(){
  renderList();
  // обычный режим: тоже красим пастельно (по индексу в options)
  renderDrum(options.map((o, oi) => ({ ...o, __oi: oi })));
  resultEl.textContent = "";
  requestAnimationFrame(() => {
  buildCardMetrics();
  applyDepthEffectFast();
});

}

function renderList(){
  listEl.innerHTML = "";
  options.forEach((o, i) => {
    const div = document.createElement("div");
    div.className = "smallCard";
    div.innerHTML = `
      <div class="icon" style="width:38px;height:38px;border-radius:14px;">
        ${escapeHtml(o.emoji || "✨")}
      </div>
      <div>
        <div class="t">${escapeHtml(o.badge ? o.badge + " — " : "")}${escapeHtml(o.text)}</div>
        <div class="b">#${i+1}</div>
      </div>
      <button>Удалить</button>
    `;
    div.querySelector("button").addEventListener("click", () => {
      options.splice(i, 1);
      saveOptions();
      renderAll();
    });
    listEl.appendChild(div);
  });
}

function renderDrum(arr){
  drumEl.innerHTML = "";
  arr.forEach(o => {
    const card = document.createElement("div");
    card.className = "card";

    // пастельный фон по исходному индексу
    const oi = Number.isFinite(o.__oi) ? o.__oi : 0;
    const bg = PASTELS[oi % PASTELS.length];
    card.style.setProperty("--card-bg", bg);

    card.innerHTML = `
      <div class="icon">${escapeHtml(o.emoji || "✨")}</div>
      <div class="meta">
        <p class="title">${escapeHtml(o.badge || "")}</p>
        <div class="badge">${escapeHtml(o.text)}</div>
      </div>
    `;
    drumEl.appendChild(card);
  });
}

/* -------- utils -------- */

function loadOptions(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}

function saveOptions(){
  localStorage.setItem(LS_KEY, JSON.stringify(options));
}

function randInt(a,b){
  return Math.floor(Math.random()*(b-a+1))+a;
}

function wait(ms){
  return new Promise(r=>setTimeout(r, ms));
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function showWinCard(w){
  // Заполняем карточку
  winIconEl.textContent = w.emoji || "✨";
  winBadgeEl.textContent = w.badge || "";
  winTitleEl.textContent = w.text || "Выигрыш";
  winDescEl.textContent = "Поздравляем! 🎉"; // можешь заменить на своё

  // если потом добавишь w.link — будет ссылка
  if (w.link) {
    winLinkEl.href = w.link;
    winLinkEl.hidden = false;
  } else {
    winLinkEl.hidden = true;
  }

  // Показать
  winCardEl.hidden = false;
  document.body.classList.add("modalOpen");
}

function buildCardMetrics(){
  const cards = drumEl.querySelectorAll(".card");
  cardMetrics = Array.from(cards).map(el => ({
    el,
    centerLocal: el.offsetTop + el.offsetHeight / 2,
    h: el.offsetHeight
  }));
}

function getTranslateY(el){
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === "none") return 0;
  // matrix(a,b,c,d,tx,ty)
  const m = tr.match(/matrix\(([^)]+)\)/);
  if (!m) return 0;
  const parts = m[1].split(",").map(Number);
  return parts.length >= 6 ? parts[5] : 0;
}

function applyDepthEffectFast(){
  const windowEl = document.querySelector(".drumWindow");
  const H = windowEl.clientHeight;
  const centerLine = H / 2;
  const maxD = H / 2;

  const y = getTranslateY(drumEl);

  for (const c of cardMetrics){
    // центр карточки в координатах окна = centerLocal + translateY
    const center = c.centerLocal + y;
    const d = Math.abs(center - centerLine);
    const t = clamp(d / maxD, 0, 1);

    const scaleX = 1 - 0.28 * t;   // твоя “большая разница”
    const scaleY = 1 - 0.10 * t;
    const opacity = 1 - 0.70 * t;

    c.el.style.transform = `scale(${scaleX}, ${scaleY})`;
    c.el.style.opacity = String(opacity);
  }
}
