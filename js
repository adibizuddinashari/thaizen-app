/* ── THAIZEN APP — SHARED STATE & UTILITIES ── */

// ── BOOKING STATE (persisted in sessionStorage) ──
const BOOKING_KEY = 'thaizen_booking';

const DEFAULT_STATE = {
  service: null,
  serviceIcon: null,
  serviceCn: null,
  dur: null,
  price: null,
  date: null,
  time: null,
  fname: '', lname: '', phone: '', email: '', notes: '',
  payment: 'Pay at Spa',
  isMember: false,
  promo: null,
  promoDisc: 0,
  promoType: null,
  finalPrice: null,
};

function getState() {
  try {
    const raw = sessionStorage.getItem(BOOKING_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch { return { ...DEFAULT_STATE }; }
}

function setState(updates) {
  const current = getState();
  const next = { ...current, ...updates };
  try { sessionStorage.setItem(BOOKING_KEY, JSON.stringify(next)); } catch {}
  return next;
}

function clearState() {
  try { sessionStorage.removeItem(BOOKING_KEY); } catch {}
}

// ── SERVICE DATA ──
const SERVICES = [
  { id:'foot',       name:'Foot Massage',               cn:'足部按摩',         icon:'🦶', cat:'basic',   prices:{'60 mins':69} },
  { id:'thai',       name:'Thai Traditional Massage',   cn:'泰式传统按摩',     icon:'🧘', cat:'basic',   prices:{'60 mins':95,'90 mins':130,'120 mins':165} },
  { id:'oil',        name:'Oil Massage',                cn:'精油按摩',         icon:'💆', cat:'basic',   prices:{'60 mins':105,'90 mins':140,'120 mins':180} },
  { id:'aroma',      name:'Aromatherapy Massage',       cn:'香薰按摩',         icon:'🌸', cat:'basic',   prices:{'60 mins':120,'90 mins':165,'120 mins':205} },
  { id:'sports',     name:'Sports Massage',             cn:'运动按摩',         icon:'💪', cat:'special', prices:{'60 mins':155} },
  { id:'candle',     name:'Hot Candle Massage',         cn:'热蜡按摩',         icon:'🕯️', cat:'special', prices:{'60 mins':175,'90 mins':255} },
  { id:'aromaHot',   name:'Aromatherapy Hot Oil',       cn:'香薰热精油按摩',   icon:'🌺', cat:'special', prices:{'60 mins':140,'90 mins':190,'120 mins':230} },
  { id:'stone',      name:'Hot Stone Massage',          cn:'热石按摩',         icon:'🪨', cat:'special', prices:{'60 mins':165,'90 mins':215,'120 mins':255} },
  { id:'balm',       name:'Thai Balm Massage',          cn:'泰式万金油按摩',   icon:'🌿', cat:'special', prices:{'60 mins':105,'90 mins':145,'120 mins':180} },
  { id:'herbal',     name:'Thai Herbal Compress',       cn:'药草按压泰式按摩', icon:'🪴', cat:'special', prices:{'45 mins':95,'90 mins':180,'120 mins':220} },
  { id:'pkgA',       name:'Package A — Foot + Shoulder',cn:'足部 + 肩部按摩',  icon:'📦', cat:'package', prices:{'90 mins':108}, badge:'Best Value' },
  { id:'pkgB',       name:'Package B — Foot + Thai',   cn:'足部 + 泰式按摩',  icon:'📦', cat:'package', prices:{'120 mins':148} },
  { id:'pkgC',       name:'Package C — Foot + Oil',    cn:'足部 + 精油按摩',  icon:'📦', cat:'package', prices:{'120 mins':158} },
  { id:'pkgD',       name:'Package D — Foot + Aroma',  cn:'足部 + 香薰按摩',  icon:'📦', cat:'package', prices:{'120 mins':168} },
  { id:'scrub',      name:'Body Scrub',                 cn:'全身磨砂护理',     icon:'✨', cat:'other',   prices:{'30 mins':88} },
  { id:'shoulder',   name:'Shoulder Massage',           cn:'肩部按摩',         icon:'💆', cat:'other',   prices:{'30 mins':50} },
  { id:'head',       name:'Head Massage',               cn:'头部按摩',         icon:'🧠', cat:'other',   prices:{'30 mins':50} },
  { id:'cupping',    name:'Cupping',                    cn:'拔罐',             icon:'🫧', cat:'other',   prices:{'30 mins':50} },
  { id:'earcandle',  name:'Ear Candle',                 cn:'耳烛护理',         icon:'🕯️', cat:'other',   prices:{'15 mins':50} },
];

const PROMOS = {
  'THAIZEN20': { type:'pct',   val:20, label:'20% off — Happy Guest' },
  'WELCOME15': { type:'pct',   val:15, label:'15% off — Welcome Offer' },
  'MEMBER10':  { type:'fixed', val:30, label:'RM30 off — Member Perk' },
  'PENANG25':  { type:'pct',   val:25, label:'25% off — Penang Special' },
  'NEWMEMBER': { type:'pct',   val:10, label:'10% off — New Member' },
};

// ── DATE / TIME HELPERS ──
const MONTHS_LONG  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const DAYS_LONG    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]} ${y}`;
}

function formatDateLong(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m)-1, parseInt(d));
  return `${DAYS_LONG[date.getDay()]}, ${parseInt(d)} ${MONTHS_SHORT[parseInt(m)-1]} ${y}`;
}

function calcDiscount(price, promo) {
  if (!promo || !PROMOS[promo]) return 0;
  const p = PROMOS[promo];
  return p.type === 'pct' ? Math.round(price * p.val / 100) : p.val;
}

function calcTotal(price, promo) {
  return price - calcDiscount(price, promo);
}

// ── TOAST ──
function showToast(msg, duration = 2800) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── BOOKING REF GENERATOR ──
function generateRef() {
  return 'TZ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── NAVIGATION ──
function navigate(path) {
  window.location.href = path;
}
