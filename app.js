const drumEl = document.getElementById("drum");
const resultEl = document.getElementById("result");
const spinBtn = document.getElementById("spin");

const winCardEl = document.getElementById("winCard");
const winIconEl = document.getElementById("winIcon");
const winBadgeEl = document.getElementById("winBadge");
const winTitleEl = document.getElementById("winTitle");
const winDescEl = document.getElementById("winDesc");
const spinMoreBtn = document.getElementById("spinMore");
const winOkBtn = document.getElementById("winOk");

/**
 * ✅ НАСТРОЙКИ СКОРОСТИ (вот тут меняешь поведение)
 * -------------------------------------------------
 * IDLE_SPEED_PX_S  — скорость "ползучего" вращения ДО клика (px/сек)
 * SPIN_DURATION_MS — длительность анимации после клика
 * BASE_FORWARD_LOOPS — сколько "полных кругов" прокрутить после клика
 */
const IDLE_SPEED_PX_S = 18;       // ← сделай 8..25 для "очень медленно"
const SPIN_DURATION_MS = 5000;    // ← общая длительность разгона/торможения
const BASE_FORWARD_LOOPS = 8;    // ← больше = дальше прокрутит перед остановкой
const FINAL_SLOWDOWN_MS = 0;   // последние 2.2s очень медленно до полной остановки
const FINAL_EXTRA_PX = 0; 

/**
 * Фиксированные варианты.
 */
const options = [
  { text: "Цветы", emoji: "🌿", badge: "3%", desc: "Порадуйте себя и близких 🌿" },
  { text: "Рождество с Афишей", emoji: "🎁", badge: "10%", desc: "Подарки стали ещё приятнее ✨" },
  { text: "Ювелирные изделия", emoji: "💎", badge: "5%", desc: "Сияйте ярче с нашим бонусом 😍" },
  { text: "Вау-кэшбэк", emoji: "🎯", badge: "до 5 000 ₽", desc: "Максимум выгоды — вот это да!" },
  { text: "Образование", emoji: "🎓", badge: "3%", desc: "Инвестируйте в себя 🎓" },
];

// пастельная палитра
const PASTELS = ["#D7E6D4", "#DCCFEA", "#CFE4E3", "#E7D6C6", "#D9D9C7"];

// “лента” должна быть длинной, чтобы всегда хватало индексов
const TAPE_LOOPS = 220;

let spinning = false;
let winTimeoutId = null;

let tape = [];
let cardMetrics = [];
let stepPx = 0;           // расстояние между центрами соседних карточек
let firstCenter = 0;      // centerLocal первой карточки
let cycleHeight = 0;      // высота одного "круга" = stepPx * options.length

let currentY = 0;         // текущий translateY барабана
let idleRafId = 0;
let spinRafId = 0;
let lastIdleTs = 0;

/* ---------- init ---------- */

buildTape();
renderDrum(tape);

// дождаться DOM layout
requestAnimationFrame(() => {
  buildCardMetrics();
  initStartPositionAtCenter();
  startIdle();
});

winOkBtn.addEventListener("click", closeWin);
spinMoreBtn.addEventListener("click", () => {
  closeWin();
  spinBtn.click();
});

spinBtn.addEventListener("click", () => {
  if (spinning || cardMetrics.length === 0) return;

  // остановить idle
  stopIdle();

  // отменить прошлый win таймер/анимацию
  if (winTimeoutId) {
    clearTimeout(winTimeoutId);
    winTimeoutId = null;
  }
  closeWin();
  if (spinRafId) cancelAnimationFrame(spinRafId);
  spinRafId = 0;

  spinOnce();
});

/* ---------- tape ---------- */

function buildTape(){
  tape = [];
  for (let i = 0; i < TAPE_LOOPS; i++) {
    for (let oi = 0; oi < options.length; oi++) {
      tape.push({ ...options[oi], __oi: oi });
    }
  }
}

function renderDrum(arr){
  drumEl.innerHTML = "";
  arr.forEach(o => {
    const card = document.createElement("div");
    card.className = "card";

    const oi = Number.isFinite(o.__oi) ? o.__oi : 0;
    card.style.setProperty("--card-bg", PASTELS[oi % PASTELS.length]);

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

/* ---------- metrics + positioning ---------- */

function buildCardMetrics(){
  const cards = drumEl.querySelectorAll(".card");
  cardMetrics = Array.from(cards).map(el => ({
    el,
    centerLocal: el.offsetTop + el.offsetHeight / 2
  }));

  if (cardMetrics.length < 2) return;

  firstCenter = cardMetrics[0].centerLocal;
  stepPx = cardMetrics[1].centerLocal - cardMetrics[0].centerLocal;

  // один "круг" — это длина списка options
  cycleHeight = stepPx * options.length;
}

function initStartPositionAtCenter() {
  const centerLine = 0;

  const first = cardMetrics[0];
  const startY = centerLine - first.centerLocal;

  currentY = startY; // ✅ важно

  drumEl.style.transition = "none";
  drumEl.style.transform = `translateY(${startY}px)`;
}


/* ---------- idle вращение ---------- */

function startIdle(){
  document.body.classList.remove("spinning");
  lastIdleTs = 0;

  const tick = (ts) => {
    if (!lastIdleTs) lastIdleTs = ts;
    const dt = (ts - lastIdleTs) / 1000;
    lastIdleTs = ts;

    // едем вверх очень медленно (как "лента")
    currentY -= IDLE_SPEED_PX_S * dt;

    // чтобы не уехать в бесконечность: оборачиваем на 1 круг
    // (когда сдвинулись больше чем на круг — возвращаем назад на круг)
    const H = document.querySelector(".drumWindow").clientHeight;
    const centerLine = H / 2;
    const minY = centerLine - (firstCenter + cycleHeight); // "достаточно низко"

    if (currentY < minY) {
      currentY += cycleHeight;
    }

    applyTranslateY(currentY);
    applyDepthEffectFast(currentY);

    idleRafId = requestAnimationFrame(tick);
  };

  idleRafId = requestAnimationFrame(tick);
}

function stopIdle(){
  if (idleRafId) cancelAnimationFrame(idleRafId);
  idleRafId = 0;
  lastIdleTs = 0;
}

/* ---------- spin (разгон → торможение) ---------- */

function spinOnce(){
  if (options.length < 2) {
    resultEl.textContent = "Нужно минимум 2 варианта 🙂";
    startIdle();
    return;
  }

  spinning = true;
  document.body.classList.add("spinning");
  resultEl.textContent = "";

  const H = document.querySelector(".drumWindow").clientHeight;
  const centerLine = H / 2;

  // текущий индекс, который примерно под центром
  const currentIndexAtCenter = Math.round((centerLine - currentY - firstCenter) / stepPx);

  // выбираем победителя
  const winnerIndex = randInt(0, options.length - 1);

  // хотим уехать вперед на много позиций
  const forward = BASE_FORWARD_LOOPS * options.length;

  // базовый целевой индекс “вперед”
  let targetIndex = currentIndexAtCenter + forward;

  // подгоняем так, чтобы targetIndex % options.length == winnerIndex
  const mod = ((targetIndex % options.length) + options.length) % options.length;
  const delta = (winnerIndex - mod + options.length) % options.length;
  targetIndex += delta;

  // защитимся, если вдруг выходим за длину ленты
  targetIndex = clamp(targetIndex, 0, cardMetrics.length - 1);

  const targetCenterLocal = cardMetrics[targetIndex].centerLocal;
  const targetY = centerLine - targetCenterLocal;

  // анимация от currentY к targetY
    const startY = currentY;

  const total = SPIN_DURATION_MS;
  const slow = FINAL_SLOWDOWN_MS;
  const fast = Math.max(300, total - slow); // защита

  const tStart = performance.now();

  // чуть-чуть “переката” в финале (можно оставить 0)
  const finalY = targetY + FINAL_EXTRA_PX;

  const step = (now) => {
    const elapsed = now - tStart;

    if (elapsed < fast) {
      // Фаза A: разгон → торможение, но без резкого импульса
      const p = clamp(elapsed / fast, 0, 1);
      const eased = easeInOutSine(p);

      currentY = lerp(startY, finalY, eased);

      applyTranslateY(currentY);
      applyDepthEffectFast(currentY);

      spinRafId = requestAnimationFrame(step);
      return;
    }

    // Фаза B: очень медленная докрутка до targetY
    const p2 = clamp((elapsed - fast) / slow, 0, 1);

    // очень мягкое затухание — быстро в начале фазы и почти “ползёт” к концу
    const eased2 = easeOutExpo(p2);

    currentY = lerp(finalY, targetY, eased2);

    applyTranslateY(currentY);
    applyDepthEffectFast(currentY);

    if (p2 < 1) {
      spinRafId = requestAnimationFrame(step);
    } else {
      spinRafId = 0;

      // ✅ ЖЁСТКО фиксируем финальную позицию, чтобы не было микро-прыжка
      currentY = targetY;
      applyTranslateY(currentY);
      applyDepthEffectFast(currentY);

      onSpinEnd(targetIndex, winnerIndex);
    }
  };

  spinRafId = requestAnimationFrame(step);

}

function onSpinEnd(targetIndex, winnerIndex){
  // подсветка
  cardMetrics.forEach(c => c.el.classList.remove("highlight"));
  if (cardMetrics[targetIndex]?.el) cardMetrics[targetIndex].el.classList.add("highlight");

  const w = options[winnerIndex];
  resultEl.textContent = `Выпало: ${w.badge ? w.badge + " — " : ""}${w.text}`;

  document.body.classList.remove("spinning");
  spinning = false;

  // показать окно победы через 1 секунду
  winTimeoutId = setTimeout(() => {
    showWinCard(w);
    winTimeoutId = null;
  }, 1000);

  // и снова включить медленное вращение
  // startIdle();
}

/* ---------- depth (быстро, без getBoundingClientRect на каждую карточку) ---------- */

function applyDepthEffectFast(y){
  const windowEl = document.querySelector(".drumWindow");
  const H = windowEl.clientHeight;
  const centerLine = H / 2;
  const maxD = H / 2;

  for (const c of cardMetrics){
    const center = c.centerLocal + y;
    const d = Math.abs(center - centerLine);
    const t = clamp(d / maxD, 0, 1);

    // сильнее разница дальних/ближней
    const scaleX = 1 - 0.30 * t;
    const scaleY = 1 - 0.12 * t;
    const opacity = 1 - 0.75 * t;

    c.el.style.transform = `scale(${scaleX}, ${scaleY})`;
    c.el.style.opacity = String(opacity);
  }
}

function applyTranslateY(y){
  drumEl.style.transform = `translateY(${y}px)`;
}

/* ---------- win modal ---------- */

function showWinCard(w){
  winIconEl.textContent = w.emoji || "✨";
  winBadgeEl.textContent = w.badge || "";
  winTitleEl.textContent = w.text || "Выигрыш";
  winDescEl.textContent = w.desc || "Поздравляем! 🎉";

  winCardEl.hidden = false;
  document.body.classList.add("modalOpen");
}

function closeWin(){
  winCardEl.hidden = true;
  document.body.classList.remove("modalOpen");
}

/* ---------- utils ---------- */

function randInt(a,b){
  return Math.floor(Math.random()*(b-a+1))+a;
}

function clamp(x, a, b){
  return Math.max(a, Math.min(b, x));
}

function lerp(a, b, t){
  return a + (b - a) * t;
}

// медленно → быстрее → медленно, мягкий разгон/торможение
function easeInOutSine(t){
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

function easeOutExpo(t){
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}


function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
