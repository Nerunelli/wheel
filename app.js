const drumEl = document.getElementById("drum");
const resultEl = document.getElementById("result");
const spinBtn = document.getElementById("spin");

const winCardEl = document.getElementById("winCard");
const winIconEl = document.getElementById("winIcon");
const winBadgeEl = document.getElementById("winBadge");
const winTitleEl = document.getElementById("winTitle");
const winDescEl = document.getElementById("winDesc");
const winOkBtn = document.getElementById("winOk");

const introCardEl = document.getElementById("introCard");
const toWheelBtn = document.getElementById("toWheel");

/**
 * ✅ НАСТРОЙКИ СКОРОСТИ (вот тут меняешь поведение)
 * -------------------------------------------------
 * IDLE_SPEED_PX_S  — скорость "ползучего" вращения ДО клика (px/сек)
 * SPIN_DURATION_MS — длительность анимации после клика
 * BASE_FORWARD_LOOPS — сколько "полных кругов" прокрутить после клика
 */
// const IDLE_SPEED_PX_S = 18;
const IDLE_SPEED_PX_S = 50;
const SPIN_DURATION_MS = 15000;
const BASE_FORWARD_LOOPS = 8;

/**
 * Варианты (цвет задаёт цвет карточки и win-плашки)
 */
const mockOptions = [
  {
    text: "Цветы",
    emoji: "🌿",
    badge: "3%",
    desc: "Порадуйте себя и близких 🌿",
    color: "#619D80" // природный зелёный
  },
  {
    text: "Рождество с Афишей",
    emoji: "🎁",
    badge: "10%",
    desc: "Подарки стали ещё приятнее ✨",
    color: "#E2D5F1" // зимний, праздничный
  },
  {
    text: "Ювелирные изделия",
    emoji: "💎",
    badge: "5%",
    desc: "Сияйте ярче с нашим бонусом 😍",
    color: "#9BF1F4" // холодный блеск, ассоциация с камнями
  },
  {
    text: "Вау-кэшбэк",
    emoji: "🎯",
    badge: "до 5 000 ₽",
    desc: "Максимум выгоды — вот это да!",
    color: "#EEBF93" // тёплый акцент, внимание
  },
  {
    text: "Образование",
    emoji: "🎓",
    badge: "3%",
    desc: "Инвестируйте в себя 🎓",
    color: "#DBCEE8" // спокойный, интеллектуальный
  }
];


/**
 * Фиксированные варианты.
 */
const options = [
  {
    text: "Колбаса и мясные продукты",
    emoji: "🍖",
    badge: "100%",
    color: "#E2A2A2",
    desc: "100% кэшбек на колбасу и мясные продукты в любых магазинах при оплате картой Альфа-банка. Максимальный размер кэшбека — 700 ₽."
  },
  {
    text: "Сыр и молочные продукты",
    emoji: "🧀",
    badge: "100%",
    color: "#e2c2a2ff",
    desc: "100% кэшбек на сыр и молочные продукты в любых магазинах при оплате картой Альфа-банка. Максимальный размер кэшбека — 700 ₽."
  },
  // {
  //   text: "Вино Апсны",
  //   emoji: "🍷",
  //   badge: "100%",
  //   color: "#b6edd8ff",
  //   desc: "Две бутылки вина Апсны за 1 ₽. Действует в любых магазинах при оплате картой Альфа-банка."
  // },
  {
    text: "АЗС",
    emoji: "🚘",
    badge: "50%",
    color: "#ffb3b3ff",
    desc: "50% кэшбека на заправку автомобиля при оплате картой Альфа-банка. Действует на всех АЗС."
  },
  {
    text: "Ostin",
    emoji: "👕",
    badge: "100%",
    color: "#DBCEE8",
    desc: "100% кэшбека на любые покупки в сети магазинов \"Ostin\" при оплате картой Альфа-банка. Максимальный размер кэшбека — 1 000 ₽."
  },
  {
    text: "ВкусВилл",
    emoji: "🛒",
    badge: "100%",
    color: "#DFEEDC",
    desc: "100% кэшбек на покупки в магазинах \"ВкусВилл\" при оплате картой Альфа-банка. Максимальный размер кэшбека — 1 000 ₽."
  },
  {
    text: "Ozon",
    emoji: "🛍",
    badge: "100%",
    color: "#8594ffff",
    desc: "100% кэшбек на заказы в сервисах \"Ozon\" и \"Ozon fresh\" при оплате картой Альфа-банка. Максимальный размер кэшбека — 1 000 ₽."
  },
  {
    text: "Wildberries",
    emoji: "🛍",
    badge: "100%",
    color: "#f585ffff",
    desc: "100% кэшбек на заказы в сервисе \"Wildberries\" при оплате картой Альфа-банка. Максимальный размер кэшбека — 1 000 ₽."
  },
  {
    text: "Техника",
    emoji: "💻",
    badge: "100%",
    color: "#9bbaf4ff",
    desc: "Ой-ой, кто-то уже потратил ваши 100% кэшбека на покупку техники.\n\nОбратитесь в техподдержку, Альфа-Маш и Альфа-Наташ всегда готовы вам помочь!"
  },
  // {
  //   text: "Жидкость для омывателя",
  //   emoji: "❄️",
  //   badge: "100%",
  //   color: "#9BF1F4",
  //   desc: "Зима в самом разгаре — позаботьтесь о чистоте стекол! 100% кэшбек на покупку жидкости для омывателя в магазине «Близнецы» при оплате Альфа-картой. Максимум — 10 л."
  // },
  {
    text: "Афиша",
    emoji: "🎭",
    badge: "100%",
    color: "#EEBF93",
    desc: "100% кэшбека при покупке билетов в театры, кинотеатры, оперы и музеи. Максимальный размер кэшбека — 2 000 ₽."
  },
  {
    text: "Азбука Вкуса",
    emoji: "🛒",
    badge: "100%",
    color: "#78cd50ff",
    desc: "100% кэшбек на покупки в магазине \"Азбука Вкуса\" при оплате картой Альфа-банка. Максимальный размер кэшбека — 1 000 ₽."
  },
];

// пастельная палитра
// const PASTELS = ["#D7E6D4", "#DCCFEA", "#CFE4E3", "#E7D6C6", "#D9D9C7"];

const PASTELS = ["#E2D5F1",
"#EEBF93",
"#f4dc94",
"#619D80",
"#E2A2A2",
"#DBCEE8",
"#DFEEDC",
"#9BF1F4",
]

// “лента” должна быть длинной, чтобы всегда хватало индексов
const TAPE_LOOPS = 220;
// сколько кругов ленты держим в DOM (чем больше — тем дольше без “отмотки”)
const IDLE_WRAP_LOOPS = 180; // ~180 кругов = примерно 5–15 минут, зависит от скорости и шага

let spinning = false;
let winTimeoutId = null;

let tape = [];
let cardMetrics = [];
let stepPx = 0;           // расстояние между центрами соседних карточек
let firstCenter = 0;      // centerLocal первой карточки
let cycleHeight = 0;      // высота одного "круга" = stepPx * options.length
let wrapHeight = 0;      // 

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

// показываем приветственную плашку поверх всего
introCardEl.hidden = false;
document.body.classList.add("modalOpen");


winOkBtn.addEventListener("click", closeWin);

toWheelBtn.addEventListener("click", () => {
  introCardEl.hidden = true;
  document.body.classList.remove("modalOpen");
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

    card.style.setProperty(
  "--card-bg",
  o.color || "#E8E8E8"
);


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
  wrapHeight = cycleHeight * IDLE_WRAP_LOOPS;

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
const minY = centerLine - (firstCenter + wrapHeight);

    if (currentY < minY) {
  currentY += wrapHeight;
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
  // const winnerIndex = randInt(0, options.length - 1);
// выбираем победителя (всегда "Техника")
const winnerIndex = Math.max(0, options.findIndex(o => o.text === "Техника"));

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

  // ✅ разгон короче, торможение дольше
  const accelMs = Math.max(250, Math.floor(total * 0.20)); // ~22% времени
  const decelMs = Math.max(400, total - accelMs - 7000);          // остальное — торможение

  const tStart = performance.now();
  const splitY = lerp(startY, targetY, 0.65); // точка, до которой “разгоняемся”

  const step = (now) => {
    const elapsed = now - tStart;

    if (elapsed < accelMs) {
      // Фаза A: разгон (короче)
      const p = clamp(elapsed / accelMs, 0, 1);
      const eased = easeInQuad(p);

      currentY = lerp(startY, splitY, eased);

      applyTranslateY(currentY);
      applyDepthEffectFast(currentY);

      spinRafId = requestAnimationFrame(step);
      return;
    }

    // Фаза B: торможение (дольше)
    const p2 = clamp((elapsed - accelMs) / decelMs, 0, 1);
    const eased2 = easeOutExpo(p2);

    currentY = lerp(splitY, targetY, eased2);

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

function easeInQuad(t){
  return t * t;
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
  const inner = winCardEl.querySelector(".winCardInner");
inner.style.background = w.color || "#E8DDF7";

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
