/* ==========================================================================
   ANDREAS NEUNKIRCH – Streifendienst in Neunkirchhausen
   Open-World-Polizei-Browsergame (HTML5 Canvas, ohne Frameworks)
   ========================================================================== */
'use strict';
(() => {

// ============================== UTILS ==============================
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtMoney = v => '€' + Math.round(v).toLocaleString('de-DE');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = clamp(Math.round(r * f), 0, 255); g = clamp(Math.round(g * f), 0, 255); b = clamp(Math.round(b * f), 0, 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============================== TEXTE & DATEN ==============================
const FIRST = ['Gerd', 'Uschi', 'Horst', 'Biggi', 'Detlef', 'Moni', 'Jürgen', 'Heike', 'Kalle', 'Sabine', 'Rüdiger', 'Gabi', 'Dieter', 'Petra', 'Bernd', 'Elke', 'Lars', 'Mandy', 'Sven', 'Jacqueline', 'Torben', 'Inge', 'Manni', 'Helga', 'Olaf', 'Susi'];
const LAST = ['Klöppel', 'Schnabel', 'Bröselmann', 'Wurstbacher', 'Pfefferle', 'Kuddel', 'Brummer', 'Zwiebel', 'Sauerbier', 'Knopf', 'Eichhorn', 'Plätzchen', 'Hupe', 'Schnellinger', 'Krawuttke', 'Möhre', 'Blinker', 'Kurbel', 'Senf'];
const FACES = ['🙂', '😀', '🧔', '👩', '👨', '👵', '👴', '🧑', '👱', '👩‍🦰', '👨‍🦳', '🙃', '😎', '🤓'];
const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#f5cba7'];
const SHIRTS = ['#e63946', '#f4a261', '#2a9d8f', '#e9c46a', '#8e7dbe', '#ff70a6', '#70d6ff', '#06d6a0', '#ef476f', '#ffd166', '#118ab2', '#9b5de5'];
const HAIRS = ['#2b1d0e', '#5a3825', '#d4a017', '#a52a2a', '#cccccc', '#111111', '#e07a5f'];
const CAR_COLORS = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#e9c46a', '#8338ec', '#ff006e', '#fb5607', '#3a86ff', '#8ac926', '#adb5bd', '#222831', '#f1faee'];
const HOUSE_COLORS = ['#f4e1c1', '#fde2e4', '#e2ece9', '#fff1e6', '#dfe7fd', '#f0efeb', '#ffe5b4', '#e8f0d8'];
const ROOF_COLORS = ['#b5654a', '#9c4f3c', '#6d6875', '#7f5539', '#8d99ae', '#a44a3f', '#5e6472'];
const randomName = () => pick(FIRST) + ' ' + pick(LAST);

const PED_GREETINGS = ['Guten Tag, Herr Wachtmeister!', 'Oh, Polizei! Ich hab nix gemacht. Glaube ich.', 'Moin! Schönes Wetter für eine Streife, was?', 'Ist was passiert? Ich liebe Drama.', 'Sie sind doch der Andreas! Meine Oma redet ständig von Ihnen.', 'Hallo! Sind Sie echt oder ist das ein Kostüm?', 'Tag! Können Sie mal meinen Nachbarn verhaften? Nur so zum Spaß?'];
const PED_SMALLTALK = ['Wussten Sie, dass die Tauben hier im Park eine Gewerkschaft gegründet haben?', 'Der Donut-Laden hat jetzt Donuts mit Blaulicht-Glasur. Nur für Sie!', 'Mein Mann sagt, ich fahre zu langsam. Ich fahre gar nicht. Ich gehe.', 'Opa Günther fährt schon wieder 12 km/h auf der Autobahn. Er sagt, er genießt die Aussicht.', 'Im Supermarkt gibt es heute Gratisproben. Man munkelt, jemand hat schon 30 gegessen.', 'Ich habe gehört, im Krankenhaus ist es sehr gesund.', 'Mein Hund kann Sitz, Platz und Steuererklärung. Okay, nur Sitz.', 'Die Feuerwehr spielt schon seit Stunden Tischkicker. Es brennt also nirgends. Gut so!'];
const IDLE_LINES = ['Wo hab ich nur geparkt?', 'Hmm, Bratwurst oder Döner?', 'Schon wieder Montag...', 'Ist das eine Taube oder ein Spion?', 'La la laaa ♪', 'Ich muss noch Brötchen holen.', 'Hat jemand mein Fahrrad gesehen?', 'Heute mach ich Sport. Morgen. Vielleicht.', 'Diese Straße war gestern länger.', 'Ich bin heute so produktiv!', 'Wer hat den Sommer geklaut?'];
const CHATTER = [['Hast du gehört? Der Bäcker hat jetzt WLAN!', 'Und? Schmecken die Brötchen jetzt besser?'], ['Ich fahre nie zu schnell.', 'Du hast doch gar kein Auto.'], ['Schönes Wetter heute!', 'Wir sind in Deutschland. Warte 5 Minuten.'], ['Mein Nachbar atmet so laut.', 'Ruf doch die Polizei!'], ['Der Polizist da ist echt nett.', 'Andreas? Der hat mal meine Katze gerettet. Glaub ich.'], ['Hast du Kleingeld?', 'Nur Treuepunkte.'], ['Ich habe eine Diät angefangen.', 'Warum hast du dann einen Donut in der Hand?'], ['Wollen wir ins Kino?', 'Läuft da wieder „Der Falschparker 3"?']];
const SIREN_LINES = ['Oh, Blaulicht!', 'Ich war\'s nicht!', 'Tatütata!', 'Uiii, Action!', 'Zeig\'s ihnen, Andreas!', 'Schnell, schnell!', 'Hab ich den Herd ausgemacht?', 'Wow, laut!'];
const DODGE_LINES = ['Hey, pass doch auf!', 'Huch!', 'Das ist ein Gehweg!', 'Ich zeig Sie an! ...Ach nee.', 'Mein Kaffee!'];
const RADIO_CHATTER = ['Zentrale an alle: Die Kaffeemaschine im Revier ist wieder repariert.', 'Zentrale: Wer hat den letzten Donut gegessen? Wir ermitteln intern.', 'Streife 7: Alles ruhig im Industriegebiet. Zu ruhig.', 'Zentrale: Opa Günther wurde mit 12 km/h auf der A9 gesichtet. Kein Handlungsbedarf.', 'Streife 3: Ente auf dem Südring. Sie hat Vorfahrt genommen.', 'Zentrale: Erinnerung – Dienstbesprechung morgen um 8. Es gibt Kuchen.', 'Streife 5: Gartenzwerg in der Vorstadt sieht verdächtig aus. Behalten ihn im Auge.', 'Zentrale an Andreas: Der Chef sagt, du machst das gut. Er hat dabei fast gelächelt.', 'Zentrale: Feuerwehr meldet: Tischkicker-Turnier läuft. Bitte nicht stören.', 'Streife 2: Die Tauben am Marktplatz formieren sich wieder.'];
const COMPLAINTS = ['„Mein Nachbar mäht seinen Rasen in Schlangenlinien. Das ist doch Absicht!"', '„Die Sonne scheint zu hell in mein Schlafzimmer. Bitte abstellen."', '„Ein Eichhörnchen hat mich schief angeguckt."', '„Die Ente im Park hat mir mein Brötchen geklaut. Ich will Anzeige erstatten."', '„Warum ist die Polizeistation nachts beleuchtet? Ich kann nicht schlafen."', '„Mein Navi hat mich in einen See geschickt. Ich bin nicht reingefahren, aber trotzdem!"'];
const CHECK_OK = [{ text: 'Hier, mein Ausweis. Das Foto ist 20 Jahre alt, ich weiß.', reply: 'Alles in Ordnung. Schönen Tag noch!', rep: 1 }, { text: 'Bitteschön! Ich habe sogar meinen Bibliotheksausweis dabei.', reply: 'Sehr vorbildlich. Danke!', rep: 1 }, { text: 'Klar! Ich wurde noch nie kontrolliert. Das ist so aufregend!', reply: 'Freut mich, dass ich Ihren Tag versüßen konnte.', rep: 2 }];
const CHECK_FUNNY = [{ text: 'Mein Ausweis? Ich habe nur meine Kundenkarte vom Baumarkt.', reply: 'Die zählt leider nicht. Bitte nächstes Mal den Ausweis mitnehmen.', rep: 1 }, { text: 'Ich bin ein Geheimagent. Mein Ausweis ist geheim.', reply: 'Und Ihr Name steht auf Ihrem T-Shirt.', rep: 1 }, { text: 'Hier! Moment... das ist ein Foto von meiner Katze.', reply: 'Hübsche Katze. Den Ausweis bitte trotzdem.', rep: 1 }];
const CHECK_ISSUE = [{ text: 'Ähm, mein Ausweis ist seit 2019 abgelaufen. Ist das schlimm?', reply: 'Bitte zeitnah beim Bürgeramt erneuern. Das ist eine Verwarnung.', rep: 2 }, { text: 'Ich hab gar keinen dabei. Der liegt im Gefrierfach.', reply: 'Im... Gefrierfach. Bitte auftauen und immer mitführen.', rep: 1 }];
const EXCUSES = ['Ich bin zu spät, weil eine Taube meinen Weg blockiert hat.', 'Ich musste schnell fahren, mein Eis schmilzt!', 'Das war nicht ich, das war mein Navi. Es heißt Brigitte und ist sehr ungeduldig.', 'Ich hab Sie gar nicht gesehen! ...Wegen dem Blaulicht.', 'Ich übe für meine Führerscheinprüfung. Morgen. Zum siebten Mal.', 'Meine Schwiegermutter sitzt hinten. Ich wollte schnell ankommen. Oder gar nicht. Ich weiß es nicht mehr.'];
const PURSUIT_LINES = ['Ich dachte, Sie wollten ein Rennen fahren! Sie hatten doch die Lichter an!', 'Ich bin nur geflüchtet, weil mein Radio gerade das beste Lied gespielt hat.', 'Okay, okay. Die Pizza im Kofferraum wird kalt. Das war es wert.', 'Ich wollte nur testen, ob Ihr Auto schneller ist. Ist es.', 'Ich hatte Angst, dass Sie mein Auto hässlich finden.'];
const FOOT_CRIMES = ['Er hat im Supermarkt 23 Gratisproben Käse eingesteckt.', 'Er hat sein Bibliotheksbuch seit 2019 nicht zurückgegeben. Es heißt „Pünktlichkeit für Anfänger".', 'Er ist nur gerannt, weil alle anderen auch gerannt sind. Es war aber niemand sonst da.', 'Er hat Enten im Park Brot gegeben. Trotz Schild. Mehrmals.', 'In seinem Rucksack: 40 Kugelschreiber vom Bürgeramt.'];
const ALARM_FALSE = [['Filialleiterin', '👩‍💼', 'Tut mir leid! Die Katze vom Hausmeister ist durch die Lichtschranke gelaufen. Schon wieder.'], ['Kassierer', '🧑', 'Ich hab aus Versehen den roten Knopf statt den Kaffeeknopf gedrückt. Die sehen sich so ähnlich!'], ['Azubi Kevin', '🧑‍🎓', 'Ich wollte nur testen, ob der Alarm funktioniert. ...Er funktioniert.'], ['Inhaber', '👨', 'Ein Heliumballon ist gegen den Bewegungsmelder geflogen. Er heißt übrigens Rüdiger. Der Ballon.']];
const HELP_SCENARIOS = [
  { text: 'Meine Katze sitzt seit drei Stunden auf dem Dach. Sie wirkt aber sehr zufrieden.', choices: [{ t: 'Feuerwehr verständigen', xp: 40, money: 15, rep: 2, res: 'Die Feuerwehr rückt an. In dem Moment springt die Katze selbst runter. Natürlich.' }, { t: 'Mit Thunfisch locken', xp: 50, money: 15, rep: 3, res: 'Funktioniert! Die Katze ignoriert Sie trotzdem. Typisch Katze.' }] },
  { text: 'Ich habe mich verlaufen. Ich wohne seit 30 Jahren hier, aber die Straße hat sich bewegt!', choices: [{ t: 'Den Weg erklären', xp: 35, money: 10, rep: 3, res: 'Sie bedankt sich und geht in die falsche Richtung. Aber selbstbewusst!' }, { t: 'Karte auf das Handy malen', xp: 40, money: 10, rep: 2, res: 'Ihr Handy ist ein Taschenrechner. Es klappt trotzdem.' }] },
  { text: 'Mein Auto springt nicht an! Ich hab schon dreimal freundlich gefragt!', choices: [{ t: 'Starthilfe geben', xp: 45, money: 20, rep: 3, res: 'Brumm! Läuft. Er nennt sein Auto jetzt „Andreas".' }, { t: 'Abschleppdienst rufen', xp: 35, money: 15, rep: 1, res: 'Der Abschleppdienst kommt in „zwei bis acht Stunden".' }] },
  { text: 'Ein Eichhörnchen starrt mich seit zehn Minuten an. Das ist doch nicht normal!', choices: [{ t: 'Das Eichhörnchen verwarnen', xp: 50, money: 10, rep: 2, res: 'Das Eichhörnchen nimmt die Verwarnung zur Kenntnis und geht. Respekt.' }, { t: 'Beruhigen: Es ist nur neugierig', xp: 40, money: 10, rep: 3, res: 'Der Mann beruhigt sich. Das Eichhörnchen macht sich Notizen.' }] },
  { text: 'Ich habe meinen Schlüssel im Auto eingeschlossen. Der Motor läuft noch. Und das Radio. Schlager.', choices: [{ t: 'Schlüsseldienst rufen', xp: 45, money: 20, rep: 2, res: 'Der Schlüsseldienst kommt. Das Radio spielt die ganze Zeit „Atemlos".' }, { t: 'Nach Ersatzschlüssel fragen', xp: 40, money: 15, rep: 3, res: '„Ach ja, der hängt an meinem Hals." Problem gelöst.' }] }
];

const RANKS = [
  { name: 'Polizeianwärter', xp: 0, rep: 0 },
  { name: 'Polizist', xp: 300, rep: 5 },
  { name: 'Oberpolizist', xp: 900, rep: 15 },
  { name: 'Polizeiobermeister', xp: 2000, rep: 30 },
  { name: 'Polizeihauptmeister', xp: 3800, rep: 50 },
  { name: 'Einsatzleiter', xp: 6500, rep: 80 }
];
const MISSION_TYPES = {
  traffic: { name: 'Verkehrskontrolle', icon: '🚗', rank: 0, xp: 50, money: 20, desc: 'Ein Fahrzeug mit Sirene anhalten und den Fahrer kontrollieren.' },
  alarm: { name: 'Alarm', icon: '🏪', rank: 0, xp: 80, money: 40, desc: 'Ein Geschäft meldet Alarm. Vor Ort nachsehen – vielleicht ein Fehlalarm?' },
  accident: { name: 'Verkehrsunfall', icon: '🚦', rank: 0, xp: 100, money: 50, desc: 'Mit den Beteiligten sprechen und entscheiden, wie es weitergeht.' },
  footchase: { name: 'Verdächtiger rennt weg', icon: '🏃', rank: 1, xp: 120, money: 60, desc: 'Zu Fuß hinterher und den Flüchtigen einholen.' },
  pursuit: { name: 'Verfolgungsjagd', icon: '🚨', rank: 1, xp: 150, money: 100, desc: 'Ein Fahrzeug flüchtet. Dranbleiben und stoppen!' },
  missing: { name: 'Vermisste Person', icon: '👤', rank: 2, xp: 500, money: 300, desc: 'Hinweise in der Stadt sammeln und die Person finden. Großer Einsatz!' },
  bigchase: { name: 'Großfahndung', icon: '🚁', rank: 4, xp: 500, money: 300, desc: 'Ein extrem schneller Flüchtiger. Nur für Profis.' }
};
const VEHICLES = [
  { id: 'streife', name: 'Streifenwagen', rank: 0, price: 0, max: 360, acc: 300, turn: 2.7, l: 56, w: 28, color: '#f4f6fb', stripe: '#1f5fd6', icon: '🚓' },
  { id: 'kompakt', name: 'Kompakt-Streife', rank: 1, price: 250, max: 345, acc: 370, turn: 3.3, l: 46, w: 26, color: '#f4f6fb', stripe: '#2a9d8f', icon: '🚙' },
  { id: 'motorrad', name: 'Polizei-Motorrad', rank: 2, price: 600, max: 435, acc: 430, turn: 3.7, l: 40, w: 14, color: '#f4f6fb', stripe: '#1f5fd6', bike: true, icon: '🏍️' },
  { id: 'zivil', name: 'Zivilstreife', rank: 3, price: 1200, max: 420, acc: 360, turn: 2.9, l: 54, w: 27, color: '#3a3f4a', stripe: '#3a3f4a', icon: '🕶️' },
  { id: 'suv', name: 'Einsatz-SUV', rank: 4, price: 2000, max: 395, acc: 345, turn: 2.6, l: 64, w: 32, color: '#1b2a4a', stripe: '#e9eef8', icon: '🚐' },
  { id: 'interceptor', name: 'Interceptor', rank: 5, price: 3500, max: 540, acc: 500, turn: 3.1, l: 58, w: 28, color: '#0b0f1a', stripe: '#3a86ff', icon: '🏎️' }
];
const EQUIP = [
  { id: 'shoes', name: 'Laufschuhe Turbo', icon: '👟', price: 150, desc: '+20 % Sprinttempo' },
  { id: 'thermos', name: 'Kaffee-Thermoskanne', icon: '☕', price: 120, desc: 'Ausdauer regeneriert doppelt so schnell' },
  { id: 'megaphone', name: 'Megafon', icon: '📢', price: 200, desc: 'Fahrzeuge halten schon aus größerer Entfernung an' },
  { id: 'notebook', name: 'Goldener Notizblock', icon: '📒', price: 400, desc: '+15 % XP bei allen Einsätzen' },
  { id: 'radio', name: 'Funkgerät Pro', icon: '📻', price: 250, desc: 'Deutlich häufigere Funksprüche' },
  { id: 'sunglasses', name: 'Pilotenbrille', icon: '🕶️', price: 80, desc: '+1 Ruf pro Einsatz. Sieht einfach cool aus.' }
];

// ============================== SPEICHERN ==============================
const SAVE_KEY = 'andreasNeunkirch_save_v1';
function defaultState() {
  return {
    rank: 0, xp: 0, money: 50, rep: 0,
    vehicles: ['streife'], vehicle: 'streife',
    equipOwned: [], equipOn: [],
    stats: { missions: 0, byType: {}, tickets: 0, chases: 0, caught: 0, found: 0, events: 0, checks: 0, distance: 0, playtime: 0, crashes: 0 },
    log: [], promoNotified: false, tutorialDone: false,
    settings: { sound: true, volume: 0.6 }
  };
}
function merge(base, src) {
  if (!src || typeof src !== 'object') return base;
  for (const k of Object.keys(src)) {
    const b = base[k], s = src[k];
    if (b && typeof b === 'object' && !Array.isArray(b) && s && typeof s === 'object' && !Array.isArray(s)) merge(b, s);
    else if (b === undefined || (typeof b === typeof s && Array.isArray(b) === Array.isArray(s))) base[k] = s;
  }
  return base;
}
function loadState() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return { st: merge(defaultState(), JSON.parse(raw)), had: true }; } catch (e) { /* ignore */ }
  return { st: defaultState(), had: false };
}
const loaded = loadState();
let state = loaded.st;
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* voll / privat */ } }
const hasEquip = id => state.equipOn.includes(id);

// ============================== WELT ==============================
const W = 4400, H = 3400;
const VX = [300, 1300, 2300, 3300, 4150];
const HY = [280, 1000, 1800, 2600, 3250];
const HW = [160, 100, 100, 100, 100];
const VW = 100, SW = 26;
const H_NAMES = ['Autobahn A9', 'Bahnhofstraße', 'Hauptstraße', 'Lindenallee', 'Südring'];
const V_NAMES = ['Westring', 'Revierstraße', 'Marktstraße', 'Klinikweg', 'Ostring'];

const roads = [], sideRoads = [], buildings = [], decals = [], trees = [], parked = [], props = [], walls = [];
const houses = [], interactables = [], pads = [];
const pois = {};
roads.push({ x: 0, y: HY[0] - HW[0] / 2, w: W, h: HW[0], kind: 'highway', name: H_NAMES[0] });
for (let j = 1; j < HY.length; j++) roads.push({ x: VX[0] - VW / 2, y: HY[j] - HW[j] / 2, w: VX[4] - VX[0] + VW, h: HW[j], kind: 'road', name: H_NAMES[j] });
for (let i = 0; i < VX.length; i++) roads.push({ x: VX[i] - VW / 2, y: HY[0] + HW[0] / 2, w: VW, h: HY[4] + HW[4] / 2 - (HY[0] + HW[0] / 2), kind: 'road', vertical: true, name: V_NAMES[i] });

// ---------- Kollisions-Gitter ----------
const CELL = 160, GC = Math.ceil(W / CELL), GR = Math.ceil(H / CELL);
const grid = Array.from({ length: GC * GR }, () => []);
function cellsOf(o) {
  let x0, y0, x1, y1;
  if (o.r) { x0 = o.cx - o.r; y0 = o.cy - o.r; x1 = o.cx + o.r; y1 = o.cy + o.r; } else { x0 = o.x; y0 = o.y; x1 = o.x + o.w; y1 = o.y + o.h; }
  const out = [];
  for (let gx = Math.max(0, Math.floor(x0 / CELL)); gx <= Math.min(GC - 1, Math.floor(x1 / CELL)); gx++)
    for (let gy = Math.max(0, Math.floor(y0 / CELL)); gy <= Math.min(GR - 1, Math.floor(y1 / CELL)); gy++) out.push(gx + gy * GC);
  return out;
}
function addSolid(o) { for (const c of cellsOf(o)) grid[c].push(o); return o; }
function removeSolid(o) { for (const c of cellsOf(o)) { const i = grid[c].indexOf(o); if (i >= 0) grid[c].splice(i, 1); } }
function hitSolid(x, y, r) {
  if (x < r || y < r || x > W - r || y > H - r) return true;
  const gx0 = Math.max(0, Math.floor((x - r) / CELL)), gx1 = Math.min(GC - 1, Math.floor((x + r) / CELL));
  const gy0 = Math.max(0, Math.floor((y - r) / CELL)), gy1 = Math.min(GR - 1, Math.floor((y + r) / CELL));
  for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
    for (const o of grid[gx + gy * GC]) {
      if (o.r) { const dx = x - o.cx, dy = y - o.cy, rs = r + o.r; if (dx * dx + dy * dy < rs * rs) return o; }
      else { const cx = clamp(x, o.x, o.x + o.w), cy = clamp(y, o.y, o.y + o.h), dx = x - cx, dy = y - cy; if (dx * dx + dy * dy < r * r) return o; }
    }
  }
  return null;
}
function freeSpot(x, y, r = 10) {
  if (!hitSolid(x, y, r)) return { x, y };
  for (let rad = 10; rad <= 120; rad += 10) for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2, nx = x + Math.cos(a) * rad, ny = y + Math.sin(a) * rad;
    if (!hitSolid(nx, ny, r)) return { x: nx, y: ny };
  }
  return { x, y };
}

function building(x, y, w, h, opt = {}) {
  const b = Object.assign({ x, y, w, h, color: '#d9c7a7', roof: null, hgt: 26, label: '' }, opt);
  buildings.push(b); addSolid(b); return b;
}
function addTree(x, y, r = 16, solid = true) {
  const t = { x, y, r, c: pick(['#2d6a4f', '#40916c', '#52b788', '#386641']) };
  trees.push(t); if (solid) addSolid({ cx: x, cy: y, r: r * 0.55 }); return t;
}
function addParked(x, y, a, color, opt = {}) {
  const c = Object.assign({ x, y, a, color: color || pick(CAR_COLORS), l: 52, w: 26, parked: true }, opt);
  const horiz = Math.abs(Math.cos(a)) > 0.5;
  const rw = horiz ? c.l : c.w, rh = horiz ? c.w : c.l;
  c.solid = addSolid({ x: x - rw / 2, y: y - rh / 2, w: rw, h: rh, type: 'parked' });
  parked.push(c); return c;
}
function removeParked(c) { removeSolid(c.solid); const i = parked.indexOf(c); if (i >= 0) parked.splice(i, 1); }
function poi(id, name, x, y, icon) { pois[id] = { id, name, x, y, icon }; return pois[id]; }
const doorOf = b => ({ x: b.x + b.w / 2, y: b.y + b.h + 16 });

// ---------- Blöcke ----------
const LAYOUT = [
  ['industrial', 'industrial', 'gas', 'suburb'],
  ['residential', 'police', 'center', 'hospital'],
  ['residential', 'center2', 'park', 'fire'],
  ['suburb', 'suburb', 'parking', 'suburb']
];
const ZONE_NAMES = { industrial: 'Industriegebiet', gas: 'Tankstelle', suburb: 'Vorstadt', residential: 'Wohngebiet', police: 'Polizeistation', center: 'Stadtzentrum', center2: 'Altstadt', hospital: 'Krankenhaus', park: 'Stadtpark', fire: 'Feuerwehr', parking: 'Einkaufszentrum' };
const ZONE_COLORS = { industrial: '#bdb6a8', gas: '#c9c4bb', suburb: '#9fd49a', residential: '#a8d5a2', police: '#cfd6e0', center: '#ddd6c8', center2: '#e0d5c1', hospital: '#d3e4df', park: '#86c77d', fire: '#d8cfc7', parking: '#c3c6cc' };
const blocks = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
  const x1 = VX[c] + VW / 2, x2 = VX[c + 1] - VW / 2, y1 = HY[r] + HW[r] / 2, y2 = HY[r + 1] - HW[r + 1] / 2;
  blocks.push({ c, r, kind: LAYOUT[r][c], x: x1, y: y1, w: x2 - x1, h: y2 - y1, name: ZONE_NAMES[LAYOUT[r][c]] });
}
const blockAt = (x, y) => blocks.find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) || null;

let industrialIdx = 0, residentialIdx = 0;
const STATION = { x: 1450, y: 1110, w: 620, h: 400 };
const CAR_SPAWN = { x: 2150, y: 1390, a: 0 };
const PLAYER_SPAWN = { x: 1760, y: 1470 };

function genIndustrial(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80, idx = industrialIdx++;
  const names = idx === 0 ? ['Schraubenfabrik Rost & Co.', 'Lagerhalle 7'] : ['Spedition Eilig', 'Recyclinghof'];
  const w1 = building(ix, iy, iw * 0.52, ih * 0.5, { color: '#a9b2bd', roof: '#6f7a87', hgt: 34, label: names[0] });
  building(ix + iw * 0.6, iy, iw * 0.4, ih * 0.42, { color: '#b8b0a2', roof: '#7d6f5c', hgt: 30, label: names[1] });
  const cols = ['#d1495b', '#2e86ab', '#f4a259', '#5b8e7d', '#8d6a9f'];
  for (let k = 0; k < 6; k++) building(ix + 20 + k * 88, iy + ih - 70, 70, 30, { color: pick(cols), hgt: 12, container: true });
  decals.push({ type: 'lot', x: ix + iw * 0.6, y: iy + ih * 0.5, w: iw * 0.4, h: ih * 0.32 });
  addParked(ix + iw * 0.7, iy + ih * 0.66, Math.PI / 2, '#f1faee', { l: 74, w: 30, truck: true });
  poi(idx === 0 ? 'factory' : 'depot', names[0], w1.x + w1.w / 2, w1.y + w1.h + 16, '🏭');
}
function genGas(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80;
  decals.push({ type: 'lot', x: ix, y: iy, w: iw * 0.62, h: ih * 0.62 });
  decals.push({ type: 'canopy', x: ix + 60, y: iy + 50, w: 340, h: 170, label: 'TANKE 24/7' });
  for (let k = 0; k < 3; k++) { const p = addSolid({ x: ix + 110 + k * 110, y: iy + 125, w: 22, h: 22, type: 'pump' }); props.push({ type: 'pump', x: p.x, y: p.y }); }
  const shop = building(ix + iw - 280, iy + 20, 240, 150, { color: '#f2efe6', roof: '#e63946', hgt: 24, label: 'Tankstellen-Shop' });
  poi('gas', 'Tankstelle', shop.x + shop.w / 2, shop.y + shop.h + 16, '⛽');
  building(ix + iw - 280, iy + ih - 150, 240, 120, { color: '#cfe8ef', roof: '#3d8eb9', hgt: 22, label: 'Waschanlage' });
  decals.push({ type: 'lot', x: ix, y: iy + ih * 0.62 + 20, w: iw * 0.55, h: ih * 0.38 - 20 });
  addParked(ix + 70, iy + ih - 60, 0, '#9b5de5');
  addParked(ix + 160, iy + ih - 60, 0);
  props.push({ type: 'sign', x: ix + 30, y: iy - 20, text: 'Hier könnte Ihre Werbung stehen' });
}
function genSuburb(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80, cols = 3, rows = 2, cw = iw / cols, ch = ih / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const hx = ix + c * cw + 20, hy = iy + r * ch + 20;
    const hw = Math.min(140, cw - 60), hh = Math.min(100, ch - 90);
    const h = building(hx, hy, hw, hh, { color: pick(HOUSE_COLORS), roof: pick(ROOF_COLORS), hgt: 22, house: true });
    houses.push({ x: hx + hw / 2, y: hy + hh + 14, b: h });
    if (Math.random() < 0.45) decals.push({ type: 'pool', x: hx + hw + 12, y: hy + 10, w: Math.min(56, cw - hw - 46), h: 40 });
    addTree(hx + hw + 40, hy + hh + 52, rand(14, 19));
    if (Math.random() < 0.5) addTree(hx + 10, hy + hh + 60, rand(12, 16));
    if (Math.random() < 0.3) props.push({ type: 'gnome', x: hx + hw / 2 - 30, y: hy + hh + 30 });
  }
}
function genResidential(b) {
  const idx = residentialIdx++;
  const sy = b.y + b.h / 2 - 30;
  sideRoads.push({ x: b.x, y: sy, w: b.w, h: 60, kind: 'side', name: idx === 0 ? 'Rosenweg' : 'Tulpenweg' });
  const n = 5, gap = (b.w - 80) / n;
  for (const top of [true, false]) for (let k = 0; k < n; k++) {
    const hw = gap - 50, hh = 110;
    const hx = b.x + 40 + k * gap + 10, hy = top ? sy - 30 - hh : sy + 60 + 30;
    const tall = k % 2 === 1;
    const h = building(hx, hy, hw, hh, { color: pick(HOUSE_COLORS), roof: pick(ROOF_COLORS), hgt: tall ? 40 : 24, label: tall && top && k === 1 ? 'Mehrfamilienhaus' : '', house: true });
    houses.push({ x: hx + hw / 2, y: top ? hy + hh + 14 : hy - 14, b: h });
    if (top) addTree(hx + hw / 2 + rand(-20, 20), b.y + 70 + rand(0, 40), rand(14, 20));
    else addTree(hx + hw / 2 + rand(-20, 20), b.y + b.h - 70 - rand(0, 30), rand(14, 20));
  }
  for (let k = 0; k < 3; k++) addParked(b.x + 120 + k * 260, sy + 15, 0);
}
function genCenter(b, variant) {
  const ax = b.x + b.w / 2 - 22, ay = b.y + b.h / 2 - 22;
  sideRoads.push({ x: ax, y: b.y, w: 44, h: b.h, kind: 'alley', name: 'Gasse' });
  sideRoads.push({ x: b.x, y: ay, w: b.w, h: 44, kind: 'alley', name: 'Gasse' });
  const sets = variant === 1
    ? [['rathaus', 'Rathaus', '#e9d8a6', '#9b2226', '🏛️'], ['bank', 'Stadtbank', '#cdd7e3', '#33415c', '🏦'], ['cafe', 'Café Krümel', '#f6bd60', '#84a59d', '☕'], ['kino', 'Kino Lichtspiel', '#e5989b', '#6d597a', '🎬']]
    : [['bakery', 'Bäckerei Knusper', '#ffe8d6', '#cb997e', '🥐'], ['donut', 'Donut-Paradies', '#ffc8dd', '#cd5d7d', '🍩'], ['kiosk', 'Kiosk Ecke', '#d8e2dc', '#588157', '🗞️'], ['electro', 'Elektro Blitz', '#bde0fe', '#457b9d', '⚡']];
  const quads = [[b.x, b.y, ax - b.x, ay - b.y], [ax + 44, b.y, b.x + b.w - ax - 44, ay - b.y], [b.x, ay + 44, ax - b.x, b.y + b.h - ay - 44], [ax + 44, ay + 44, b.x + b.w - ax - 44, b.y + b.h - ay - 44]];
  quads.forEach((q, k) => {
    const [qx, qy, qw, qh] = q, [id, nm, col, roof, icon] = sets[k];
    const bx = qx + 40, by = qy + 40, bw = qw - 70, bh = qh - 80;
    const split = bw > 300;
    const mainW = split ? bw * 0.62 : bw;
    const bd = building(bx, by, mainW, bh, { color: col, roof, hgt: 40 + k * 6, label: nm, shop: true });
    if (split) building(bx + mainW + 16, by, bw - mainW - 16, bh * 0.8, { color: pick(HOUSE_COLORS), roof: pick(ROOF_COLORS), hgt: 52 });
    poi(id, nm, bd.x + bd.w / 2, bd.y + bd.h + 16, icon);
  });
  props.push({ type: 'fountain', x: ax + 22, y: ay + 22 });
}
function genHospital(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80;
  const hb = building(ix, iy, iw * 0.62, ih * 0.6, { color: '#f8f9fa', roof: '#ced4da', hgt: 50, label: 'KRANKENHAUS', cross: true });
  poi('hospital', 'Krankenhaus', hb.x + hb.w / 2, hb.y + hb.h + 16, '🏥');
  decals.push({ type: 'helipad', x: ix + iw * 0.7, y: iy + 20, w: 150, h: 150 });
  decals.push({ type: 'lot', x: ix, y: iy + ih * 0.7, w: iw, h: ih * 0.3, lines: true });
  addParked(ix + 60, iy + ih * 0.85, Math.PI / 2, '#ffffff', { ambulance: true, l: 60, w: 28 });
  addParked(ix + 140, iy + ih * 0.85, Math.PI / 2);
  addParked(ix + 300, iy + ih * 0.85, Math.PI / 2);
  for (let k = 0; k < 4; k++) addTree(ix + iw * 0.72 + k * 40, iy + ih * 0.55, 14);
}
function genFire(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80;
  const fb = building(ix, iy, iw * 0.6, ih * 0.42, { color: '#f1e3d3', roof: '#c1121f', hgt: 36, label: 'FEUERWEHR', fire: true });
  poi('fire', 'Feuerwache', fb.x + fb.w / 2, fb.y + fb.h + 16, '🚒');
  decals.push({ type: 'lot', x: ix, y: iy + ih * 0.42 + 10, w: iw * 0.6, h: 90 });
  addParked(ix + 70, iy + ih * 0.42 + 55, 0, '#d00000', { l: 80, w: 32, firetruck: true });
  building(ix + iw * 0.68, iy, iw * 0.32, ih * 0.3, { color: '#e2ece9', roof: '#6d6875', hgt: 30, label: 'Parkhaus' });
  decals.push({ type: 'lot', x: ix, y: iy + ih * 0.68, w: iw, h: ih * 0.32, lines: true });
  for (let k = 0; k < 8; k++) if (Math.random() < 0.6) addParked(ix + 40 + k * 70, iy + ih * 0.84, Math.PI / 2);
  poi('parkplatz', 'Parkplatz Feuerwache', ix + iw / 2, iy + ih * 0.66, '🅿️');
}
let PARK = null;
function genPark(b) {
  decals.push({ type: 'path', x: b.x + b.w / 2 - 15, y: b.y, w: 30, h: b.h });
  decals.push({ type: 'path', x: b.x, y: b.y + b.h * 0.72, w: b.w, h: 30 });
  const pcx = b.x + b.w * 0.66, pcy = b.y + b.h * 0.36;
  PARK = { pcx, pcy, rx: 150, ry: 90 };
  decals.push({ type: 'pond', x: pcx, y: pcy, rx: 150, ry: 90 });
  addSolid({ cx: pcx - 70, cy: pcy, r: 80 }); addSolid({ cx: pcx + 70, cy: pcy, r: 80 }); addSolid({ cx: pcx, cy: pcy, r: 88 });
  const ice = building(b.x + 60, b.y + 60, 120, 80, { color: '#fff3b0', roof: '#e09f3e', hgt: 20, label: 'Eisdiele Frosti' });
  poi('park', 'Stadtpark', b.x + b.w / 2, b.y + b.h * 0.72 + 15, '🌳');
  poi('pond', 'Ententeich', pcx, pcy + 112, '🦆');
  poi('icecream', 'Eisdiele Frosti', ice.x + ice.w / 2, ice.y + ice.h + 16, '🍦');
  let placed = 0;
  for (let k = 0; k < 400 && placed < 34; k++) {
    const x = rand(b.x + 40, b.x + b.w - 40), y = rand(b.y + 40, b.y + b.h - 40);
    if (Math.abs(x - (b.x + b.w / 2)) < 50 || Math.abs(y - (b.y + b.h * 0.72 + 15)) < 50) continue;
    if (((x - pcx) / 200) ** 2 + ((y - pcy) / 140) ** 2 < 1) continue;
    if (hitSolid(x, y, 30)) continue;
    addTree(x, y, rand(15, 24)); placed++;
  }
  props.push({ type: 'statue', x: b.x + b.w / 2 + 70, y: b.y + b.h * 0.72 + 60 });
  addSolid({ x: b.x + b.w / 2 + 58, y: b.y + b.h * 0.72 + 48, w: 24, h: 24 });
  for (let k = 0; k < 4; k++) props.push({ type: 'bench', x: b.x + 120 + k * 180, y: b.y + b.h * 0.72 - 14 });
}
function genParking(b) {
  const ix = b.x + 40, iy = b.y + 40, iw = b.w - 80, ih = b.h - 80;
  const sm = building(ix, iy, iw * 0.7, 170, { color: '#fefae0', roof: '#2a9d8f', hgt: 30, label: 'SUPERMARKT Spar-o-Mat' });
  poi('supermarket', 'Supermarkt Spar-o-Mat', sm.x + sm.w / 2, sm.y + sm.h + 16, '🛒');
  building(ix + iw * 0.74, iy, iw * 0.26, 120, { color: '#e2eafc', roof: '#5a189a', hgt: 26, label: 'Apotheke' });
  decals.push({ type: 'lot', x: ix, y: iy + 200, w: iw, h: ih - 200, lines: true });
  for (let k = 0; k < 13; k++) {
    if (Math.random() < 0.55) addParked(ix + 30 + k * 60, iy + 250, Math.PI / 2);
    if (Math.random() < 0.45) addParked(ix + 30 + k * 60, iy + 400, Math.PI / 2);
  }
  props.push({ type: 'carts', x: ix + iw * 0.72, y: iy + 182 });
}
const STATION_ROOMS = { office: [100, 70], board: [315, 60], locker: [515, 80], garage: [520, 270], reception: [310, 312] };
function genPolice(b) {
  const S = STATION, ox = S.x, oy = S.y;
  const W_REL = [[0, 0, 620, 14], [0, 0, 14, 400], [0, 386, 270, 14], [350, 386, 270, 14], [606, 0, 14, 190], [606, 330, 14, 70],
    [200, 14, 10, 96], [420, 14, 10, 96], [14, 150, 130, 10], [260, 150, 160, 10],
    [430, 150, 10, 80], [430, 310, 10, 90], [430, 150, 60, 10], [550, 150, 56, 10], [250, 252, 120, 22]];
  W_REL.forEach((w, i) => { const o = { x: ox + w[0], y: oy + w[1], w: w[2], h: w[3], desk: i === W_REL.length - 1 }; walls.push(o); addSolid(o); });
  const labels = { office: '🗂️ Büro', board: '📋 Einsatztafel', locker: '👕 Umkleide', garage: '🚓 Garage', reception: '🛎️ Empfang' };
  for (const k in STATION_ROOMS) {
    const [rx, ry] = STATION_ROOMS[k];
    pads.push({ x: ox + rx, y: oy + ry, room: k, label: labels[k] });
    interactables.push({ x: ox + rx, y: oy + ry, r: 38, label: labels[k].slice(3) + ' betreten', act: () => openStation(k) });
  }
  decals.push({ type: 'lot', x: b.x + 50, y: 1545, w: b.w - 100, h: 160, lines: true, police: true });
  decals.push({ type: 'lot', x: 2085, y: 1260, w: 150, h: 240 });
  for (let k = 0; k < 9; k++) if (k !== 4 && k !== 5 && Math.random() < 0.55) addParked(1420 + k * 80, 1675, Math.PI / 2, pick(['#f4f6fb', '#f4f6fb', '#adb5bd']), { police: Math.random() < 0.6 });
  props.push({ type: 'flag', x: 1640, y: 1540 });
  props.push({ type: 'policesign', x: 1950, y: 1540 });
  for (let k = 0; k < 6; k++) addTree(1380 + k * 160, 1076, 14);
}

for (const b of blocks) {
  ({ industrial: genIndustrial, gas: genGas, suburb: genSuburb, residential: genResidential, police: genPolice, hospital: genHospital, fire: genFire, park: genPark, parking: genParking })[b.kind]?.(b);
  if (b.kind === 'center') genCenter(b, 1);
  if (b.kind === 'center2') genCenter(b, 2);
}
// Randbereiche mit Bäumen
for (let k = 0; k < 160; k++) {
  const side = k % 4; let x, y;
  if (side === 0) { x = rand(20, 230); y = rand(380, H - 40); }
  else if (side === 1) { x = rand(4220, W - 20); y = rand(380, H - 40); }
  else if (side === 2) { x = rand(40, W - 40); y = rand(3320, H - 20); }
  else { x = rand(40, W - 40); y = rand(20, 180); }
  if (!hitSolid(x, y, 26)) addTree(x, y, rand(16, 26));
}
// Easter-Egg-Schild an der Autobahn
props.push({ type: 'billboard', x: 1900, y: 120, text: 'Neunkirchhausen – Hier parkt man noch quer!' });
addSolid({ x: 1840, y: 150, w: 120, h: 12 });

// ============================== VERKEHRSNETZ ==============================
const nodes = [];
function addNode(x, y, hw, end) { nodes.push({ id: nodes.length, x, y, hw, end: !!end, links: [] }); return nodes.length - 1; }
function link(a, b) { nodes[a].links.push(b); nodes[b].links.push(a); }
const nid = HY.map((y, j) => VX.map(x => addNode(x, y, j === 0)));
const hwWest = addNode(40, HY[0], true, true), hwEast = addNode(W - 40, HY[0], true, true);
for (let j = 0; j < HY.length; j++) for (let i = 0; i < VX.length - 1; i++) link(nid[j][i], nid[j][i + 1]);
for (let i = 0; i < VX.length; i++) for (let j = 0; j < HY.length - 1; j++) link(nid[j][i], nid[j + 1][i]);
link(hwWest, nid[0][0]); link(nid[0][4], hwEast);

function insetAt(N, ux) { if (N.end) return 0; if (Math.abs(ux) > 0.5) return VW / 2 - 10; return (N.hw ? HW[0] : 100) / 2 - 10; }
function lanePts(a, b, offOverride) {
  const A = nodes[a], B = nodes[b];
  const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const off = offOverride != null ? offOverride : (A.hw && B.hw ? 38 : 24);
  const px = -uy * off, py = ux * off, ia = insetAt(A, ux), ib = insetAt(B, ux);
  return [{ x: A.x + ux * ia + px, y: A.y + uy * ia + py }, { x: B.x - ux * ib + px, y: B.y - uy * ib + py }];
}
function randomLanePoint(px, py, minD, maxD, noHw = true, off) {
  for (let k = 0; k < 120; k++) {
    const A = pick(nodes), bId = pick(A.links), B = nodes[bId];
    if (A.end || B.end) continue;
    if (noHw && (A.hw || B.hw)) continue;
    const [p, q] = lanePts(A.id, bId, off);
    const t = rand(0.15, 0.85), x = lerp(p.x, q.x, t), y = lerp(p.y, q.y, t);
    const d = Math.hypot(x - px, y - py);
    if (d < minD || d > maxD) continue;
    return { x, y, a: Math.atan2(q.y - p.y, q.x - p.x), from: A.id, to: bId };
  }
  return null;
}
function randomSidewalkNear(px, py, minD, maxD) {
  for (let k = 0; k < 200; k++) {
    const b = pick(blocks); if (b.kind === 'police') continue;
    const s = randi(0, 3); let x, y;
    if (s === 0) { x = rand(b.x + 8, b.x + b.w - 8); y = b.y + rand(6, SW - 6); }
    else if (s === 1) { x = rand(b.x + 8, b.x + b.w - 8); y = b.y + b.h - rand(6, SW - 6); }
    else if (s === 2) { x = b.x + rand(6, SW - 6); y = rand(b.y + 8, b.y + b.h - 8); }
    else { x = b.x + b.w - rand(6, SW - 6); y = rand(b.y + 8, b.y + b.h - 8); }
    const d = Math.hypot(x - px, y - py);
    if (d < minD || d > maxD || hitSolid(x, y, 10)) continue;
    return { x, y };
  }
  return null;
}
function streetAt(x, y) {
  let best = null, bd = Infinity;
  for (const r of roads.concat(sideRoads.filter(s => s.kind === 'side'))) {
    const cx = clamp(x, r.x, r.x + r.w), cy = clamp(y, r.y, r.y + r.h), d = Math.hypot(x - cx, y - cy);
    if (d < bd) { bd = d; best = r; }
  }
  return best ? best.name : 'Innenstadt';
}
function zoneAt(x, y) { const b = blockAt(x, y); if (b) return b.name; if (y < HY[0] + 90) return 'Autobahn'; return streetAt(x, y); }
function placeName(x, y) { const b = blockAt(x, y); return b ? `${b.name} (${streetAt(x, y)})` : streetAt(x, y); }

// ============================== ENTITÄTEN ==============================
const cars = [], peds = [], animals = [], floaters = [];
const P = { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y, a: -Math.PI / 2, car: null, stamina: 100, exhausted: false, moving: false, step: 0, carry: null, bubble: null, bubbleT: 0, shoutCd: 0 };
let policeCar = null;

function makeCar(opt) {
  return Object.assign({ x: 0, y: 0, a: 0, v: 0, maxV: rand(170, 240), color: pick(CAR_COLORS), l: 52, w: 26, ai: true, state: 'drive', wp: [], from: 0, to: 0, name: randomName(), bubble: null, bubbleT: 0, speedMul: 1, waitT: 0, ghostT: 0 }, opt);
}
function spawnTrafficCar(opt = {}) {
  for (let k = 0; k < 50; k++) {
    const A = pick(nodes), bId = pick(A.links), B = nodes[bId];
    if (opt.highway && !(A.hw && B.hw)) continue;
    const [p, q] = lanePts(A.id, bId), t = rand(0.1, 0.9);
    const x = lerp(p.x, q.x, t), y = lerp(p.y, q.y, t);
    if (cars.some(c => Math.hypot(c.x - x, c.y - y) < 90)) continue;
    const c = makeCar(Object.assign({ x, y, a: Math.atan2(q.y - p.y, q.x - p.x), from: A.id, to: bId, wp: [q] }, opt));
    c.v = c.maxV * 0.6; cars.push(c); return c;
  }
  return null;
}
function initTraffic() {
  for (let k = 0; k < 17; k++) spawnTrafficCar();
  for (let k = 0; k < 4; k++) spawnTrafficCar({ l: 62, w: 30, van: true, color: pick(['#f1faee', '#ffd166', '#90be6d', '#adb5bd']), maxV: rand(160, 200) });
  for (let k = 0; k < 3; k++) spawnTrafficCar({ highway: true, l: 86, w: 34, truck: true, color: pick(['#e76f51', '#264653', '#f4a261']), maxV: rand(220, 260), hwOnly: true });
  for (let k = 0; k < 4; k++) spawnTrafficCar({ highway: true, maxV: rand(330, 400), hwOnly: true });
  spawnTrafficCar({ highway: true, color: '#d4c5a1', maxV: 55, name: 'Opa Günther', opa: true, hwOnly: true, talk: true });
}
function spawnPoliceCar() {
  const spec = VEHICLES.find(v => v.id === state.vehicle) || VEHICLES[0];
  let siren = false;
  if (policeCar) { siren = policeCar.siren; const i = cars.indexOf(policeCar); if (i >= 0) cars.splice(i, 1); }
  policeCar = { x: CAR_SPAWN.x, y: CAR_SPAWN.y, a: CAR_SPAWN.a, v: 0, l: spec.l, w: spec.w, color: spec.color, stripe: spec.stripe, spec, ai: false, police: true, siren: false, bike: !!spec.bike };
  cars.push(policeCar);
  if (siren) setSiren(false);
}

function makePed(x, y, area, opt) {
  const p = Object.assign({ x, y, a: rand(0, 6.28), area, tx: x, ty: y, wait: rand(0, 3), shirt: pick(SHIRTS), skin: pick(SKINS), hair: pick(HAIRS), name: randomName(), face: pick(FACES), bubble: null, bubbleT: 0, cool: 0, state: area ? 'walk' : 'static', speed: rand(40, 70), step: 0, moving: false }, opt);
  return p;
}
function initPeds() {
  for (const b of blocks) {
    const n = b.kind === 'center' || b.kind === 'center2' ? 7 : b.kind === 'park' ? 9 : b.kind === 'police' ? 3 : b.kind === 'parking' ? 6 : 4;
    const area = b.kind === 'police' ? { x: b.x + 50, y: 1545, w: b.w - 100, h: 160 } : b;
    for (let k = 0; k < n; k++) {
      for (let t = 0; t < 30; t++) {
        const x = rand(area.x + 10, area.x + area.w - 10), y = rand(area.y + 10, area.y + area.h - 10);
        if (!hitSolid(x, y, 12)) { peds.push(makePed(x, y, area)); break; }
      }
    }
  }
  const S = STATION;
  peds.push(makePed(S.x + 310, S.y + 232, null, { name: 'Frau Beckmann', face: '👩‍💼', shirt: '#1f5fd6', cop: true, role: 'reception' }));
  peds.push(makePed(S.x + 60, S.y + 40, null, { name: 'Hauptkommissar Brösel', face: '👨‍✈️', shirt: '#1b2a4a', cop: true, role: 'chief', hair: '#cccccc' }));
  peds.push(makePed(S.x + 370, S.y + 40, null, { name: 'Kollegin Yilmaz', face: '👮‍♀️', shirt: '#1f5fd6', cop: true, role: 'colleague' }));
  // Falschparker vor der Polizeistation (Easter Egg)
  stationParker = addParked(1760, 1585, 0, '#ff006e');
  interactables.push({ x: 1760, y: 1585, r: 55, label: 'Falschparker vor dem Revier', act: talkStationParker, cond: () => !!stationParker });
}
let stationParker = null, stationParkerCd = 0;
function initAnimals() {
  if (PARK) {
    for (let k = 0; k < 5; k++) animals.push({ type: 'duck', x: PARK.pcx + rand(-90, 90), y: PARK.pcy + rand(-45, 45), a: rand(0, 6.28), t: rand(0, 3) });
    for (let k = 0; k < 7; k++) animals.push({ type: 'pigeon', x: PARK.pcx - 200 + rand(-60, 60), y: PARK.pcy + 200 + rand(-30, 30), hx: 0, hy: 0, fly: 0, a: 0 });
  }
  for (let k = 0; k < 6; k++) animals.push({ type: 'pigeon', x: VX[2] + rand(-120, 120), y: HY[2] + 90 + rand(-15, 15), fly: 0, a: 0 });
  animals.forEach(a => { if (a.type === 'pigeon') { a.hx = a.x; a.hy = a.y; } });
}

function say(ent, text, dur = 3, delay = 0) { if (delay > 0) ent.pending = { text, dur, delay }; else { ent.bubble = text; ent.bubbleT = dur; } }
function floater(x, y, text, color = '#1f5fd6') { floaters.push({ x, y, text, color, t: 1.8 }); }

// ============================== AUDIO ==============================
let actx = null, master = null, sirenOsc = null, sirenGain = null, sirenT = 0, sirenHigh = false;
function initAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.connect(actx.destination); applyVolume();
  } catch (e) { actx = null; }
}
function applyVolume() { if (master) master.gain.value = state.settings.sound ? state.settings.volume * 0.8 : 0; }
function tone(freq, dur, type = 'sine', vol = 0.2, when = 0) {
  if (!actx || !state.settings.sound) return;
  const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + when;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function sfx(n) {
  switch (n) {
    case 'radio': tone(1250, 0.05, 'square', 0.06); tone(950, 0.07, 'square', 0.06, 0.07); break;
    case 'success': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.18, i * 0.1)); break;
    case 'fail': tone(240, 0.3, 'sawtooth', 0.09); tone(170, 0.45, 'sawtooth', 0.09, 0.25); break;
    case 'coin': tone(988, 0.08, 'square', 0.07); tone(1319, 0.18, 'square', 0.07, 0.08); break;
    case 'promo': [392, 523, 659, 784, 659, 784].forEach((f, i) => tone(f, 0.25, 'triangle', 0.2, i * 0.13)); break;
    case 'whistle': tone(2300, 0.25, 'sine', 0.1); tone(2500, 0.2, 'sine', 0.1, 0.27); break;
    case 'bump': tone(90, 0.18, 'square', 0.14); break;
    case 'door': tone(300, 0.06, 'square', 0.06); tone(200, 0.08, 'square', 0.05, 0.06); break;
    case 'click': tone(700, 0.04, 'square', 0.04); break;
    case 'quack': tone(500, 0.08, 'sawtooth', 0.06); tone(420, 0.1, 'sawtooth', 0.06, 0.09); break;
  }
}
function setSiren(on) {
  if (!actx) return;
  if (on && !sirenOsc) {
    sirenOsc = actx.createOscillator(); sirenGain = actx.createGain();
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600;
    sirenOsc.type = 'square'; sirenOsc.frequency.value = 440; sirenGain.gain.value = 0.04;
    sirenOsc.connect(lp); lp.connect(sirenGain); sirenGain.connect(master); sirenOsc.start();
  } else if (!on && sirenOsc) { try { sirenOsc.stop(); } catch (e) { /* */ } sirenOsc.disconnect(); sirenOsc = null; }
}
function updateSirenAudio(dt) {
  const on = policeCar && policeCar.siren && state.settings.sound;
  if (on && !sirenOsc) setSiren(true); else if (!on && sirenOsc) setSiren(false);
  if (!sirenOsc) return;
  sirenT += dt;
  if (sirenT > 0.55) { sirenT = 0; sirenHigh = !sirenHigh; sirenOsc.frequency.setValueAtTime(sirenHigh ? 587 : 440, actx.currentTime); }
  const d = P.car ? 0 : dist(P, policeCar);
  sirenGain.gain.value = 0.04 * clamp(1 - d / 1000, 0, 1);
}

// ============================== UI-HILFEN ==============================
function toast(text, cls = '') {
  const el = document.createElement('div'); el.className = 'toast ' + cls; el.textContent = text;
  const box = $('toasts'); box.appendChild(el);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(() => el.classList.add('out'), 3200); setTimeout(() => el.remove(), 3700);
}
const radioLog = [];
function radioMsg(text, cls = 'z') {
  radioLog.push({ text, cls }); if (radioLog.length > 4) radioLog.shift();
  $('radioLog').innerHTML = radioLog.map(r => `<div class="${r.cls}">${esc(r.text)}</div>`).join('');
  sfx('radio');
}
function reward(xp, money, rep, label) {
  xp = Math.round(xp * (hasEquip('notebook') ? 1.15 : 1));
  if (hasEquip('sunglasses') && rep >= 0) rep += 1;
  state.xp += xp; state.money += money; state.rep = Math.max(-50, state.rep + rep);
  const parts = [];
  if (xp) parts.push(`+${xp} XP`); if (money) parts.push(`+${fmtMoney(money)}`); if (rep) parts.push(`${rep > 0 ? '+' : ''}${rep} Ruf`);
  toast((label ? label + ': ' : '') + parts.join('  '), 'good');
  floater(P.x, P.y - 30, parts.join(' '), '#155d33');
  sfx('coin');
  checkPromotion(); save();
}
function loseRep(n, why) { state.rep = Math.max(-50, state.rep - n); if (why) floater(P.x, P.y - 30, `-${n} Ruf (${why})`, '#c1121f'); }
const canPromote = () => state.rank < RANKS.length - 1 && state.xp >= RANKS[state.rank + 1].xp && state.rep >= RANKS[state.rank + 1].rep;
function checkPromotion() {
  if (canPromote() && !state.promoNotified) {
    state.promoNotified = true;
    toast(`⭐ Beförderung zum ${RANKS[state.rank + 1].name} möglich! Melde dich im Büro der Polizeistation.`, 'promo');
    radioMsg('Zentrale an Andreas: Der Chef will dich im Büro sehen. Es ist was Gutes!');
  }
}
function promote() {
  if (!canPromote()) return;
  state.rank++; state.promoNotified = false;
  sfx('promo'); toast(`🎖️ Befördert zum ${RANKS[state.rank].name}!`, 'promo');
  const unlocked = Object.values(MISSION_TYPES).filter(m => m.rank === state.rank).map(m => m.name);
  const veh = VEHICLES.filter(v => v.rank === state.rank).map(v => v.name);
  if (unlocked.length || veh.length) setTimeout(() => toast('Neu freigeschaltet: ' + unlocked.concat(veh).join(', '), 'mission'), 900);
  state.money += 50 * state.rank;
  save(); checkPromotion();
}
function logEntry(text) { state.log.unshift(text); if (state.log.length > 12) state.log.length = 12; }

// ============================== DIALOG ==============================
let dlg = null;
function dialog(steps, onDone) {
  dlg = { steps: steps.slice(), i: 0, onDone };
  $('dialog').classList.remove('hidden'); renderDialog();
}
function renderDialog() {
  const s = dlg.steps[dlg.i];
  $('dlgFace').textContent = s.face || '🙂'; $('dlgName').textContent = s.who || '';
  $('dlgText').textContent = s.text;
  const box = $('dlgChoices'); box.innerHTML = '';
  const list = s.choices || [{ t: dlg.i < dlg.steps.length - 1 ? 'Weiter ▸' : 'OK' }];
  list.forEach((c, k) => {
    const b = document.createElement('button');
    b.innerHTML = `<kbd>${k + 1}</kbd>${esc(c.t)}`;
    if (!s.choices) b.className = 'ghost';
    b.onclick = () => dialogChoose(k);
    box.appendChild(b);
  });
}
function dialogChoose(k) {
  if (!dlg) return;
  const s = dlg.steps[dlg.i];
  let more = null;
  if (s.choices) { const c = s.choices[k]; if (!c) return; if (c.fn) more = c.fn(); }
  sfx('click');
  if (!dlg) return;
  if (Array.isArray(more) && more.length) dlg.steps.splice(dlg.i + 1, 0, ...more);
  dlg.i++;
  if (dlg.i >= dlg.steps.length) closeDialog(); else renderDialog();
}
function closeDialog() { const d = dlg; dlg = null; $('dialog').classList.add('hidden'); if (d && d.onDone) d.onDone(); }
const ME = (text) => ({ who: 'Andreas Neunkirch', face: '👮', text });

// ============================== MISSIONEN ==============================
let mission = null;
function startMission(m) {
  if (!m) { toast('Gerade kein passender Einsatz verfügbar.', 'bad'); return false; }
  if (mission) { toast('Es läuft bereits ein Einsatz.', 'bad'); return false; }
  mission = m; m.time = 0;
  if (m.start && m.start() === false) { mission = null; toast('Einsatz konnte nicht gestartet werden.', 'bad'); return false; }
  toast(`🚨 Einsatz: ${m.title}`, 'mission');
  return true;
}
function endMission() { const m = mission; if (!m) return null; mission = null; if (m.cleanup) m.cleanup(); return m; }
function completeMission(xp, money, rep, note) {
  const m = endMission(); if (!m) return;
  state.stats.missions++; state.stats.byType[m.type] = (state.stats.byType[m.type] || 0) + 1;
  logEntry(`✅ ${m.title}${note ? ' – ' + note : ''}`);
  sfx('success');
  reward(xp, money, rep, 'Einsatz erfolgreich');
}
function failMission(reason) {
  const m = endMission(); if (!m) return;
  logEntry(`❌ ${m.title} – ${reason}`);
  loseRep(2); toast('Einsatz gescheitert: ' + reason, 'bad'); sfx('fail'); save();
}
function pickRoadCar(minD, maxD) {
  const list = cars.filter(c => c.ai && c.state === 'drive' && !c.marked && !c.opa && !c.hwOnly && !c.special);
  const good = list.filter(c => { const d = dist(c, P); return d > minD && d < maxD; });
  return pick(good.length ? good : list);
}
function nearestNodeTo(x, y, minD, maxD) {
  const cand = nodes.filter(n => !n.end && !n.hw).map(n => ({ n, d: Math.hypot(n.x - x, n.y - y) })).filter(o => o.d > minD && o.d < maxD);
  if (cand.length) return pick(cand).n;
  return pick(nodes.filter(n => !n.end && !n.hw));
}
function onFootNear(e, r) { return !P.car && Math.hypot(P.x - e.x, P.y - e.y) < r; }

// ---------- Verkehrskontrolle ----------
function createTraffic(opt = {}) {
  const car = opt.car || pickRoadCar(350, 1500);
  if (!car) return null;
  const outcome = opt.outcome || pick(['ok', 'ok', 'nolicense', 'speed', 'excuse', 'excuse']);
  const m = {
    type: 'traffic', title: 'Verkehrskontrolle', car, phase: 'find', mt: MISSION_TYPES.traffic,
    offer: opt.offer || `Zentrale an Andreas: ${pick(['Verdächtiges Fahrzeug', 'Fahrzeug mit defektem Rücklicht', 'Auffällig fahrendes Fahrzeug'])} in der ${streetAt(car.x, car.y)}. Bitte kontrollieren.`,
    get goal() {
      if (this.phase === 'find') return P.car ? 'Fahre zum markierten Fahrzeug und schalte die Sirene ein (Leertaste).' : 'Steig in deinen Streifenwagen (E) und folge dem markierten Fahrzeug.';
      if (this.phase === 'pull') return 'Das Fahrzeug fährt rechts ran …';
      return 'Steig aus (E) und sprich mit dem Fahrer (F).';
    },
    start() { if (car.state !== 'drive') return false; car.marked = true; car.special = true; },
    target() { return car; },
    update() {
      if (this.phase === 'find') {
        const range = hasEquip('megaphone') ? 280 : 190;
        if (P.car && P.car.siren && dist(P.car, car) < range) {
          this.phase = 'pull'; car.state = 'pull';
          const fx = Math.cos(car.a), fy = Math.sin(car.a);
          car.pullTo = { x: car.x + fx * 70 - fy * 22, y: car.y + fy * 70 + fx * 22 };
          say(car, pick(['Oh nein...', 'Ich fahr ja schon rechts ran!', 'Was hab ich denn gemacht?']), 2.5);
        }
      } else if (this.phase === 'pull' && car.state === 'stopped') this.phase = 'talk';
    },
    interactHint() {
      if (this.phase !== 'talk' || !onFootNear(car, 75)) return null;
      return { label: `${car.name} kontrollieren`, act: () => this.talk() };
    },
    talk() {
      const face = pick(FACES), who = car.name;
      const steps = [ME(pick(['Guten Tag, allgemeine Verkehrskontrolle. Führerschein und Fahrzeugpapiere, bitte.', 'Polizei Neunkirchhausen, guten Tag! Papiere bitte.']))];
      const done = (xp, money, rep, res, note) => { steps.length; return [{ who, face, text: res }, { who: 'Zentrale', face: '📻', text: 'Kontrolle abgeschlossen. Gute Arbeit, Andreas!', choices: [{ t: 'Einsatz abschließen', fn: () => { if (note === 'ticket') state.stats.tickets++; completeMission(xp, money, rep, note === 'ticket' ? 'Verwarngeld' : ''); } }] }]; };
      if (outcome === 'ok') steps.push({ who, face, text: 'Guten Tag! Führerschein, Fahrzeugschein, Verbandskasten, Warndreieck und ein Ersatz-Warndreieck. Alles da.', choices: [{ t: 'Alles in Ordnung. Gute Fahrt!', fn: () => done(50, 20, 3, 'Der Fahrer winkt übertrieben freundlich zum Abschied.') }] });
      else if (outcome === 'nolicense') steps.push({ who, face, text: 'Mein Führerschein? Den... hat mein Hamster gefressen. Er heißt Herbert. Der Hamster.', choices: [{ t: 'Anzeige aufnehmen', fn: () => done(70, 30, 1, 'Herbert wird im Bericht als Mitwisser vermerkt.', 'ticket') }, { t: 'Verwarnung – Führerschein nachreichen', fn: () => done(50, 20, 3, 'Der Fahrer verspricht, Herbert besser zu beaufsichtigen.') }] });
      else if (outcome === 'speed') steps.push({ who, face, text: 'Zu schnell? Ich dachte, die 50 auf dem Schild ist eine Empfehlung!', choices: [{ t: 'Verwarngeld kassieren', fn: () => done(60, 35, 0, '„Kann ich mit Treuepunkten zahlen?" – Nein.', 'ticket') }, { t: 'Mündliche Verwarnung', fn: () => done(50, 20, 3, 'Er fährt ab jetzt exakt 49,9 km/h. Für immer.') }] });
      else steps.push({ who, face, text: pick(EXCUSES), choices: [{ t: 'Na gut. Weiterfahren, aber vorsichtig!', fn: () => done(50, 20, 2, 'Erleichtert fährt der Wagen davon. Mit Blinker. Zum ersten Mal.') }, { t: 'Verwarnung aussprechen', fn: () => done(55, 25, 0, '„Ich werde es meiner Taube erzählen." Okay.', 'ticket') }] });
      dialog(steps);
    },
    cleanup() { car.marked = false; car.special = false; if (car.state === 'stopped' || car.state === 'pull') car.state = 'drive'; car.speeder = false; car.speedMul = 1; }
  };
  return m;
}

// ---------- Verfolgungsjagd ----------
function createPursuit(big) {
  const pp = playerPos();
  const node = nearestNodeTo(pp.x, pp.y, big ? 900 : 700, big ? 1700 : 1400);
  const mt = big ? MISSION_TYPES.bigchase : MISSION_TYPES.pursuit;
  const m = {
    type: big ? 'bigchase' : 'pursuit', title: mt.name, phase: 'chase', meter: 0, lostT: 0, bumpCd: 0, node, mt,
    offer: big ? `Zentrale an alle: GROSSFAHNDUNG! Hochmotorisiertes Fahrzeug rast durch ${zoneAt(node.x, node.y)}!` : `Zentrale an Andreas: Achtung! Fahrzeug flüchtet vor einer Kontrolle – zuletzt ${streetAt(node.x, node.y)}!`,
    get goal() {
      if (this.phase === 'chase') return (this.lostT > 4 ? '⚠️ Du verlierst den Flüchtigen! ' : '') + 'Verfolge das Fahrzeug, bleib dicht dran oder ramme es, bis es anhält.';
      return 'Steig aus (E) und sprich mit dem Fahrer (F).';
    },
    get progress() { return this.phase === 'chase' ? this.meter : null; },
    start() {
      const to = pick(node.links.filter(id => !nodes[id].end)) ?? node.links[0];
      const [p] = lanePts(node.id, to);
      this.car = makeCar({ x: p.x, y: p.y, a: Math.atan2(nodes[to].y - node.y, nodes[to].x - node.x), from: node.id, to, wp: [], state: 'flee', maxV: big ? 370 : 300, color: big ? '#ffbe0b' : pick(['#e63946', '#222831', '#8338ec']), name: big ? '„Turbo-Toni"' : randomName(), marked: true, special: true, v: 200 });
      if (big) { this.car.l = 56; this.car.sport = true; }
      cars.push(this.car);
      radioMsg('Andreas: Verstanden, nehme die Verfolgung auf!', 'a');
    },
    target() { return this.car; },
    update(dt) {
      const c = this.car; this.bumpCd -= dt;
      if (this.phase !== 'chase') return;
      const d = dist(P, c);
      if (P.car && d < 140) this.meter += dt * (0.11 + (P.car.siren ? 0.05 : 0)) * (big ? 0.75 : 1);
      else if (d > 260) this.meter -= dt * 0.035;
      this.meter = clamp(this.meter, 0, 1);
      if (d > 1500) this.lostT += dt; else this.lostT = Math.max(0, this.lostT - dt * 2);
      if (this.lostT > 20) { failMission('Das Fahrzeug ist entkommen.'); return; }
      if (this.meter >= 1) {
        this.phase = 'arrest'; c.state = 'stopped'; c.v = 0;
        toast('Fahrzeug gestoppt!', 'good'); say(c, 'Okay, okay! Ich geb auf!', 3);
        state.stats.chases++;
      }
    },
    onBump(c) { if (this.bumpCd > 0 || this.phase !== 'chase') return; this.bumpCd = 0.6; this.meter = clamp(this.meter + 0.12, 0, 1); c.slowT = 1.2; floater(c.x, c.y - 20, 'RUMMS!', '#e63946'); },
    interactHint() {
      if (this.phase !== 'arrest' || !onFootNear(this.car, 80)) return null;
      return { label: 'Fahrer zur Rede stellen', act: () => {
        const who = this.car.name, face = big ? '😎' : pick(FACES);
        dialog([ME('Aussteigen, bitte! Hände so, dass ich sie sehen kann.'), { who, face, text: pick(PURSUIT_LINES), choices: [
          { t: 'Festnehmen & abschleppen lassen', fn: () => [{ who: 'Zentrale', face: '📻', text: 'Abschleppdienst ist unterwegs. Starke Leistung, Andreas!', choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(mt.xp, mt.money, 4, 'Festnahme') }] }] },
          { t: 'Strafzettel & ordentliche Standpauke', fn: () => [{ who, face, text: 'Ich werde nie wieder flüchten. Höchstens weglaufen. Nein! Auch nicht!', choices: [{ t: 'Einsatz abschließen', fn: () => { state.stats.tickets++; completeMission(Math.round(mt.xp * 0.9), Math.round(mt.money * 1.2), 2, 'Strafzettel'); } }] }] }
        ] }]);
      } };
    },
    cleanup() { const c = this.car; if (c) { c.marked = false; c.removeT = 3; c.state = 'stopped'; } }
  };
  return m;
}

// ---------- Verdächtiger rennt weg (Fußverfolgung) ----------
function spawnFleeingSuspect(x, y) {
  const s = makePed(x, y, null, { state: 'flee', name: randomName(), face: pick(['😬', '😅', '🫣', '😰']), shirt: pick(['#222', '#3d405b', '#e63946']), fleeSpeed: 205, runT: rand(5, 8), pause: 0, suspect: true });
  peds.push(s); say(s, pick(['Oh nein, die Polizei!', 'Nix wie weg!', 'Ich war das nicht!']), 2.5);
  return s;
}
function chaseUpdate(m, dt) {
  const s = m.suspect, d = dist(P, s);
  m.warnCd = (m.warnCd || 0) - dt;
  if (!P.car && d < 26) {
    s.state = 'static'; m.phase = 'caught'; state.stats.caught++;
    dialog([{ who: s.name, face: s.face, text: 'Ich habe wirklich nichts gemacht!' }, ME('Ich habe noch gar nichts gesagt.'), { who: s.name, face: s.face, text: '...' },
      { who: s.name, face: s.face, text: '*keuch* Okay. Was wollen Sie wissen?', choices: [
        { t: 'Ausweis kontrollieren', fn: () => [{ who: 'Andreas Neunkirch', face: '👮', text: 'Bei der Kontrolle stellt sich heraus: ' + pick(FOOT_CRIMES) }, { who: 'Zentrale', face: '📻', text: 'Sauber gelaufen, Andreas! Der Fall ist geklärt.', choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(m.rewardXp || MISSION_TYPES.footchase.xp, m.rewardMoney || MISSION_TYPES.footchase.money, 3, 'Verdächtiger gestellt') }] }] },
        { t: 'Fragen, warum er weggerannt ist', fn: () => [{ who: s.name, face: s.face, text: 'Ich... wollte nur mal sehen, ob ich schneller bin. Bin ich nicht.' }, { who: 'Zentrale', face: '📻', text: 'Verwarnung notiert. Gut gemacht!', choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(Math.round((m.rewardXp || 120) * 0.9), m.rewardMoney || 60, 4, 'Verwarnung') }] }] }
      ] }]);
    return;
  }
  if (P.car && d < 60 && m.warnCd <= 0) { m.warnCd = 4; toast('Den erwischst du nur zu Fuß! Steig aus (E).', 'mission'); }
  if (d > 950) m.lostT = (m.lostT || 0) + dt; else m.lostT = Math.max(0, (m.lostT || 0) - dt);
  if (m.lostT > 14) failMission('Der Verdächtige ist entkommen.');
}
function createFootchase() {
  const pp = playerPos();
  const sp = randomSidewalkNear(pp.x, pp.y, 260, 650) || randomSidewalkNear(pp.x, pp.y, 100, 1500);
  if (!sp) return null;
  const m = {
    type: 'footchase', title: 'Verdächtiger rennt weg', phase: 'chase', sp, mt: MISSION_TYPES.footchase,
    offer: `Zentrale an Andreas: Person flüchtet zu Fuß im Bereich ${zoneAt(sp.x, sp.y)}!`,
    get goal() { return this.phase === 'chase' ? ((this.lostT || 0) > 5 ? '⚠️ Gleich ist er weg! ' : '') + 'Lauf dem Verdächtigen hinterher und hol ihn ein (zu Fuß, Shift = Sprint).' : 'Gestellt!'; },
    get progress() { return this.phase === 'chase' ? clamp(1 - (dist(P, this.suspect) - 26) / 700, 0, 1) : null; },
    start() { this.suspect = spawnFleeingSuspect(sp.x, sp.y); },
    target() { return this.suspect; },
    update(dt) { if (this.phase === 'chase') chaseUpdate(this, dt); },
    cleanup() { if (this.suspect) { this.suspect.state = 'static'; this.suspect.removeT = 4; } }
  };
  return m;
}

// ---------- Alarm ----------
const ALARM_SHOPS = ['supermarket', 'gas', 'bank', 'bakery', 'kiosk', 'electro', 'donut', 'cafe', 'icecream'];
function createAlarm(shopId) {
  const shop = pois[shopId || pick(ALARM_SHOPS)];
  if (!shop) return null;
  const thief = Math.random() < 0.38;
  const m = {
    type: 'alarm', title: `Alarm: ${shop.name}`, phase: 'go', shop, mt: MISSION_TYPES.alarm,
    offer: shop.id === 'gas' ? 'Zentrale an Andreas: Kannst du kurz bei der Tankstelle vorbeischauen? Der Alarm geht.' : `Zentrale an Andreas: ${shop.name} meldet einen Alarm. Bitte überprüfen.`,
    get goal() {
      if (this.phase === 'go') return `Fahre zu: ${shop.name} und überprüfe den Alarm (F am Eingang).`;
      if (this.phase === 'chase') return ((this.lostT || 0) > 5 ? '⚠️ Gleich ist er weg! ' : '') + 'Der Dieb flüchtet! Lauf hinterher und hol ihn ein!';
      return '…';
    },
    get progress() { return this.phase === 'chase' && this.suspect ? clamp(1 - (dist(P, this.suspect) - 26) / 700, 0, 1) : null; },
    start() {
      const sp = freeSpot(shop.x + 22, shop.y + 4);
      this.clerk = makePed(sp.x, sp.y, null, { name: 'Ladenpersonal', face: '🧑‍💼', shirt: '#ffd166' });
      peds.push(this.clerk); say(this.clerk, 'Hier! Hierher!', 999);
    },
    target() { return this.phase === 'chase' ? this.suspect : shop; },
    update(dt) { if (this.phase === 'chase') chaseUpdate(this, dt); },
    interactHint() {
      if (this.phase !== 'go' || !onFootNear(shop, 70)) return null;
      return { label: 'Alarm überprüfen', act: () => {
        this.clerk.bubbleT = 0;
        if (thief) {
          dialog([ME('Polizei! Was ist hier los?'), { who: 'Ladenpersonal', face: '😱', text: 'Da! Der Typ mit der verdächtig vollen Jacke! Er rennt weg!', choices: [{ t: 'Hinterher!', fn: () => {
            this.phase = 'chase'; this.rewardXp = 150; this.rewardMoney = 80;
            const sp = freeSpot(shop.x - 30, shop.y + 10);
            this.suspect = spawnFleeingSuspect(sp.x, sp.y);
          } }] }]);
        } else {
          const [who, face, text] = pick(ALARM_FALSE);
          dialog([ME('Polizei! Sie haben einen Alarm gemeldet?'), { who, face, text, choices: [
            { t: 'Kein Problem, passiert jedem.', fn: () => [{ who: 'Zentrale', face: '📻', text: 'Fehlalarm bestätigt. Danke, Andreas!', choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(80, 40, 3, 'Fehlalarm') }] }] },
            { t: 'Alarmanlage besser einstellen lassen!', fn: () => [{ who, face, text: 'Mach ich! Ich kleb einen Zettel auf den roten Knopf.', choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(90, 40, 1, 'Fehlalarm') }] }] }
          ] }]);
        }
      } };
    },
    cleanup() { if (this.clerk) { this.clerk.bubbleT = 0; this.clerk.removeT = 3; } if (this.suspect) { this.suspect.state = 'static'; this.suspect.removeT = 4; } }
  };
  return m;
}

// ---------- Verkehrsunfall ----------
function createAccident() {
  const pp = playerPos();
  const lp = randomLanePoint(pp.x, pp.y, 500, 1400) || randomLanePoint(pp.x, pp.y, 200, 3000);
  if (!lp) return null;
  const m = {
    type: 'accident', title: 'Verkehrsunfall', phase: 'go', lp, talked: 0, mt: MISSION_TYPES.accident,
    offer: `Zentrale an Andreas: Kleiner Verkehrsunfall in der ${streetAt(lp.x, lp.y)}. Blechschaden, keine Verletzten.`,
    get goal() { return this.phase === 'go' ? `Fahre zur Unfallstelle (${streetAt(lp.x, lp.y)}).` : `Sprich mit beiden Beteiligten (${this.talked}/2).`; },
    start() {
      const [p, q] = lanePts(lp.from, lp.to, 48);
      const t = clamp(((lp.x - p.x) * (q.x - p.x) + (lp.y - p.y) * (q.y - p.y)) / ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 || 1), 0.1, 0.8);
      const ux = Math.cos(lp.a), uy = Math.sin(lp.a);
      const x = lerp(p.x, q.x, t), y = lerp(p.y, q.y, t);
      this.c1 = makeCar({ x, y, a: lp.a + 0.35, state: 'wreck', marked: true, special: true, v: 0 });
      this.c2 = makeCar({ x: x + ux * 56, y: y + uy * 56, a: lp.a + Math.PI - 0.5, state: 'wreck', special: true, v: 0 });
      cars.push(this.c1, this.c2);
      const px = -uy, py = ux;
      const s1 = freeSpot(x + px * 18, y + py * 18, 9), s2 = freeSpot(x + ux * 56 + px * 18, y + uy * 56 + py * 18, 9);
      this.d1 = makePed(s1.x, s1.y, null, { name: this.c1.name, face: '😤', state: 'static' });
      this.d2 = makePed(s2.x, s2.y, null, { name: this.c2.name, face: '🙄', state: 'static' });
      peds.push(this.d1, this.d2);
      say(this.d1, 'Das war SEINE Schuld!', 999); say(this.d2, 'Nein, IHRE!', 999);
    },
    target() { if (this.phase === 'go') return this.c1; if (!this.d1.talked) return this.d1; return this.d2; },
    update() { if (this.phase === 'go' && dist(P, this.c1) < 260) this.phase = 'talk'; },
    interactHint() {
      if (this.phase !== 'talk') return null;
      for (const [d, lines] of [[this.d1, ['Ich stand ganz still! Naja, fast. Also ungefähr.', 'Ich hab extra geblinkt! Gestern schon!']], [this.d2, ['Sie hat plötzlich gebremst! Wegen eines Eichhörnchens!', 'Ich hab nur ganz kurz aufs Handy geguckt. Auf die Uhr! Auf die Uhr!']]]) {
        if (!d.talked && onFootNear(d, 55)) return { label: `Mit ${d.name} sprechen`, act: () => {
          d.talked = true; d.bubbleT = 0; this.talked++;
          dialog([ME('Polizei. Erzählen Sie mal, was passiert ist.'), { who: d.name, face: d.face, text: pick(lines) }], () => { if (this.talked >= 2) this.decide(); });
        } };
      }
      return null;
    },
    decide() {
      const fin = (xp, money, rep, text, note) => [{ who: 'Zentrale', face: '📻', text, choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(xp, money, rep, note) }] }];
      dialog([{ who: 'Andreas Neunkirch', face: '👮', text: 'Beide Seiten gehört. Wie gehe ich vor?', choices: [
        { t: '⚠️ Verwarnung aussprechen', fn: () => fin(70, 40, 3, 'Beide bekommen eine Verwarnung und schütteln sich widerwillig die Hand.', 'Verwarnung') },
        { t: '📝 Unfall aufnehmen', fn: () => fin(100, 50, 2, 'Unfallbericht aufgenommen. Inklusive Skizze vom Eichhörnchen.', 'Unfallbericht') },
        { t: '🚛 Hilfe rufen (Abschleppdienst)', fn: () => fin(90, 45, 3, 'Der Abschleppdienst ist unterwegs. Er bringt Kaffee für alle mit.', 'Abschleppdienst') }
      ] }]);
    },
    cleanup() { for (const c of [this.c1, this.c2]) if (c) { c.marked = false; c.removeT = 4; } for (const d of [this.d1, this.d2]) if (d) { d.bubbleT = 0; d.removeT = 4; } }
  };
  return m;
}

// ---------- Vermisste Person ----------
const MISSING = [['Opa Willi', '👴', 'er'], ['Tante Gerda', '👵', 'sie'], ['Herr Schussel', '🧔', 'er'], ['Frau Träumer', '👩‍🦳', 'sie']];
const CLUE_POIS = ['bakery', 'gas', 'supermarket', 'kiosk', 'cafe', 'hospital', 'donut', 'rathaus', 'kino', 'fire', 'icecream', 'electro'];
const CLUE_LINES = ['Hat drei Brötchen gekauft und nach dem Weg gefragt.', 'Hat eine Stunde lang über Tauben geredet.', 'Wollte mit Muscheln bezahlen.', 'Hat jedem erzählt, heute sei Donnerstag. Es ist nicht Donnerstag.', 'Hat sich nach dem schnellsten Weg „irgendwohin" erkundigt.', 'Hat einen Schirm gekauft. Bei Sonnenschein.'];
function createMissing() {
  const [name, face, pron] = pick(MISSING);
  const ids = shuffle(CLUE_POIS.slice()).slice(0, 3).filter(id => pois[id]);
  if (ids.length < 3) return null;
  const finals = [['pond', 'Oh, hallo! Ich füttere nur kurz die Enten. Seit heute Morgen. Wie spät ist es?'], ['icecream', 'Ich konnte mich nicht für eine Eissorte entscheiden. Das dauert eben.'], ['park', 'Ich habe ein Nickerchen auf der Bank gemacht. Ein laaanges.']];
  const [finId, finText] = pick(finals);
  const m = {
    type: 'missing', title: `Vermisst: ${name}`, idx: 0, ids, name, face, mt: MISSION_TYPES.missing, phase: 'clues',
    offer: `Zentrale an Andreas: Vermisstenmeldung – ${name}. Zuletzt gesehen bei: ${pois[ids[0]].name}.`,
    get goal() { return this.phase === 'final' ? `Hinweis: ${name} müsste bei „${pois[finId].name}" sein. Finde ${pron === 'er' ? 'ihn' : 'sie'}!` : `Hinweis ${this.idx + 1}/3: Befrage den Zeugen bei „${pois[ids[this.idx]].name}".`; },
    get progress() { return this.idx / 4; },
    start() {
      this.witnesses = ids.map(id => { const p = pois[id], s = freeSpot(p.x + rand(-20, 20), p.y + 6); const w = makePed(s.x, s.y, null, { name: 'Zeuge ' + pick(FIRST), face: pick(FACES) }); peds.push(w); return w; });
      say(this.witnesses[0], 'Ich hab was gesehen!', 999);
    },
    target() { return this.phase === 'final' ? this.person : this.witnesses[this.idx]; },
    interactHint() {
      if (this.phase === 'clues') {
        const w = this.witnesses[this.idx];
        if (!onFootNear(w, 55)) return null;
        return { label: `${w.name} befragen`, act: () => {
          w.bubbleT = 0;
          const last = this.idx === 2;
          const next = last ? pois[finId].name : pois[ids[this.idx + 1]].name;
          dialog([ME(`Haben Sie ${name} gesehen?`), { who: w.name, face: w.face, text: `Ja, ${name} war hier! ${pick(CLUE_LINES)} Ich glaube, ${pron} wollte danach zu: ${next}.` }], () => {
            reward(25, 0, 0, 'Hinweis gefunden');
            this.idx++;
            if (last) { this.phase = 'final'; const fp = pois[finId], s = freeSpot(fp.x + 20, fp.y + 12); this.person = makePed(s.x, s.y, null, { name, face, state: 'static', shirt: '#f4a261' }); peds.push(this.person); say(this.person, 'La la la ♪', 999); }
            else say(this.witnesses[this.idx], 'Hier! Ich weiß was!', 999);
          });
        } };
      }
      if (this.phase === 'final' && onFootNear(this.person, 55)) return { label: `${name} ansprechen`, act: () => {
        this.person.bubbleT = 0;
        dialog([ME(`${name}? Die ganze Stadt sucht Sie!`), { who: name, face, text: finText }, ME('Ihre Familie macht sich Sorgen. Ich bringe Sie nach Hause.'), { who: name, face, text: 'Oh! Ist es schon so spät? Na gut. Darf ich vorne sitzen? Mit Blaulicht?', choices: [
          { t: 'Na klar, mit Blaulicht!', fn: () => { state.stats.found++; completeMission(500, 300, 8, 'Person gefunden'); } },
          { t: 'Nur ohne Blaulicht.', fn: () => { state.stats.found++; completeMission(480, 300, 6, 'Person gefunden'); } }
        ] }]);
      } };
      return null;
    },
    cleanup() { (this.witnesses || []).forEach(w => { w.bubbleT = 0; w.removeT = 3; }); if (this.person) { this.person.bubbleT = 0; this.person.removeT = 3; } }
  };
  return m;
}

// ---------- Bürgereinsätze (Funk) ----------
const VISITS = [
  { title: 'Extrem lautes Radio', offer: 'Anwohnerbeschwerde: extrem lautes Radio in der {street}.', place: 'house', who: 'Herr Krawallski', face: '🧓', lines: ['WAS? ICH KANN SIE NICHT HÖREN! DAS RADIO IST ZU LAUT!', 'WIE BITTE? SCHLAGER? JA, DAS IST SCHLAGER!'], choices: [{ t: 'Radio leiser drehen lassen', xp: 60, money: 30, rep: 4, res: 'Er dreht leiser. Die ganze Straße applaudiert.' }, { t: 'Fragen, welcher Sender das ist', xp: 70, money: 30, rep: 1, res: '„Schlager-Express, rund um die Uhr." Sie bereuen die Frage.' }] },
  { title: 'Ruhestörung (?)', offer: 'Eine Anwohnerin meldet, ihr Nachbar atme „zu laut". {street}.', place: 'house', who: 'Frau Spitzohr', face: '👵', lines: ['Hören Sie das? Er ATMET. Die ganze Zeit!', 'Gestern hat er sogar geniest. Ohne Vorwarnung!'], choices: [{ t: 'Erklären, dass Atmen erlaubt ist', xp: 60, money: 30, rep: 3, res: 'Sie ist enttäuscht. Aber sie akzeptiert es. Vorerst.' }, { t: 'Nachbarn bitten, leiser zu atmen', xp: 70, money: 30, rep: 1, res: 'Der Nachbar atmet jetzt sehr bewusst. Es ist irgendwie schlimmer.' }] },
  { title: 'Parkplatzstreit', offer: 'Zwei Personen streiten sich um einen Parkplatz am Supermarkt.', place: 'supermarket', who: 'Herr Eilig & Frau Vorfahrt', face: '😤', lines: ['ICH war zuerst da!', 'Ich hab aber geblinkt! Seit gestern!'], choices: [{ t: 'Münzwurf entscheiden lassen', xp: 70, money: 35, rep: 2, res: 'Kopf. Beide sind unzufrieden. Gerechtigkeit!' }, { t: 'Auf den freien Platz daneben zeigen', xp: 80, money: 35, rep: 5, res: 'Stille. Beide hatten ihn nicht gesehen.' }, { t: 'Beide verwarnen', xp: 60, money: 45, rep: -1, res: 'Beide fahren beleidigt weg. Der Platz bleibt frei.' }] },
  { title: 'Taube blockiert Kreuzung', offer: 'Eine Taube blockiert seit 20 Minuten die Kreuzung {street}.', place: 'intersection', who: 'Taube', face: '🐦', lines: ['Gurr.', 'Gurr gurr. (Sie bewegt sich keinen Millimeter.)'], choices: [{ t: 'Freundlich bitten, weiterzugehen', xp: 60, money: 25, rep: 3, res: 'Die Taube geht. Langsam. Sehr langsam. Mit Würde.' }, { t: 'Brotkrumen auf den Gehweg streuen', xp: 70, money: 25, rep: 2, res: 'Jetzt sind es 14 Tauben. Aber auf dem Gehweg!' }] },
  { title: 'Gartenzwerg vermisst', offer: 'Gartenzwerg „Manfred" in der {street} als vermisst gemeldet!', place: 'house', who: 'Herr Pingelig', face: '👨‍🦳', lines: ['Manfred stand 25 Jahre auf diesem Rasen! Jetzt ist er weg!', '... Oh. Moment. Da steht er ja. Hinter dem Busch. Er hat sich wohl versteckt.'], choices: [{ t: 'Gratulieren zum Wiedersehen', xp: 60, money: 25, rep: 3, res: 'Herr Pingelig umarmt Manfred. Manfred lächelt wie immer.' }, { t: 'Manfred förmlich verwarnen', xp: 70, money: 25, rep: 2, res: 'Manfred zeigt keinerlei Reue.' }] },
  { title: 'Brezel-Notfall', offer: 'Bäckerei Knusper meldet einen Streit um die letzte Brezel.', place: 'bakery', who: 'Bäckermeisterin Knusper', face: '👩‍🍳', lines: ['Die letzte Brezel war reserviert! Und dann hat sie der Herr da einfach gegessen!', 'Er sagt, sie hat ihn „so angeguckt".'], choices: [{ t: 'Neue Brezeln backen lassen', xp: 70, money: 30, rep: 4, res: 'In 20 Minuten gibt es frische Brezeln. Frieden in der Altstadt.' }, { t: 'Brezel-Dieb zahlen lassen', xp: 60, money: 40, rep: 2, res: 'Er zahlt. Und kauft noch zwei. Für unterwegs.' }] }
];
function createVisit(v) {
  v = v || pick(VISITS);
  let place;
  if (v.place === 'house') { const h = pick(houses); place = { x: h.x, y: h.y }; }
  else if (v.place === 'intersection') { const n = pick(nodes.filter(n => !n.hw && !n.end)); place = { x: n.x + 20, y: n.y + 20 }; }
  else place = pois[v.place] || pois.supermarket;
  const street = streetAt(place.x, place.y);
  const m = {
    type: 'visit', title: v.title, place, mt: { xp: 60, money: 30 },
    offer: 'Zentrale an Andreas: ' + v.offer.replace('{street}', street),
    get goal() { return `Fahre zum Einsatzort (${street}) und kläre die Lage (F).`; },
    start() {
      const s = freeSpot(place.x, place.y, 10);
      if (v.place === 'intersection') { this.npc = { x: s.x, y: s.y, name: 'Taube', face: '🐦', bubble: null, bubbleT: 0 }; this.pigeon = { type: 'pigeon', x: s.x, y: s.y, hx: s.x, hy: s.y, fly: 0, a: 0, stubborn: true }; animals.push(this.pigeon); }
      else { this.npc = makePed(s.x, s.y, null, { name: v.who, face: v.face }); peds.push(this.npc); say(this.npc, 'Herr Wachtmeister! Hier!', 999); }
    },
    target() { return this.npc; },
    interactHint() {
      if (!onFootNear(this.npc, 60)) return null;
      return { label: v.place === 'intersection' ? 'Mit der Taube verhandeln' : `Mit ${v.who} sprechen`, act: () => {
        this.npc.bubbleT = 0;
        const steps = [ME('Polizei Neunkirchhausen. Was ist los?')];
        v.lines.forEach((l, i) => steps.push({ who: v.who, face: v.face, text: l, choices: i === v.lines.length - 1 ? v.choices.map(c => ({ t: c.t, fn: () => [{ who: 'Andreas Neunkirch', face: '👮', text: c.res, choices: [{ t: 'Einsatz abschließen', fn: () => completeMission(c.xp, c.money, c.rep, v.title) }] }] })) : undefined }));
        dialog(steps);
      } };
    },
    cleanup() { if (this.pigeon) { this.pigeon.stubborn = false; this.pigeon.fly = 3; this.pigeon.remove = true; } else if (this.npc) { this.npc.bubbleT = 0; this.npc.removeT = 3; } }
  };
  return m;
}

function createMission(type) {
  switch (type) {
    case 'traffic': return createTraffic();
    case 'pursuit': return createPursuit(false);
    case 'bigchase': return createPursuit(true);
    case 'alarm': return createAlarm();
    case 'accident': return createAccident();
    case 'footchase': return createFootchase();
    case 'missing': return createMissing();
    case 'visit': return createVisit();
  }
  return null;
}

// ============================== POLIZEIFUNK ==============================
const radio = { t: 40, offer: null, chatterT: 25 };
function updateRadio(dt) {
  radio.chatterT -= dt;
  if (radio.chatterT <= 0) { radio.chatterT = rand(40, 80); radioMsg(pick(RADIO_CHATTER)); }
  if (radio.offer) {
    radio.offer.ttl -= dt;
    $('radioOfferBar').style.width = (radio.offer.ttl / radio.offer.max * 100) + '%';
    if (radio.offer.ttl <= 0) { radio.offer = null; $('radioOffer').classList.add('hidden'); radioMsg('Zentrale: Hat sich erledigt, ein Kollege übernimmt.'); }
    return;
  }
  if (mission) return;
  radio.t -= dt * (hasEquip('radio') ? 1.7 : 1);
  if (radio.t <= 0) { radio.t = rand(28, 50); makeOffer(); }
}
function makeOffer() {
  const pool = [];
  for (const [k, mt] of Object.entries(MISSION_TYPES)) if (mt.rank <= state.rank) { const w = k === 'missing' || k === 'bigchase' ? 1 : 3; for (let i = 0; i < w; i++) pool.push(k); }
  for (let i = 0; i < 4; i++) pool.push('visit');
  const m = createMission(pick(pool));
  if (!m) return;
  radio.offer = { m, ttl: 28, max: 28 };
  $('radioOfferText').textContent = m.offer;
  $('radioOffer').classList.remove('hidden');
  radioMsg(m.offer);
}
function acceptOffer() {
  if (!radio.offer) return;
  if (mission) { toast('Beende zuerst den aktuellen Einsatz.', 'bad'); return; }
  const m = radio.offer.m; radio.offer = null; $('radioOffer').classList.add('hidden');
  if (startMission(m)) radioMsg('Andreas: Verstanden, bin unterwegs!', 'a');
}
function declineOffer() { if (!radio.offer) return; radio.offer = null; $('radioOffer').classList.add('hidden'); radioMsg('Andreas: Negativ, bin gerade gebunden.', 'a'); }

// ============================== ZUFALLSEREIGNISSE ==============================
const events = [];
let eventTimer = 35;
function updateEvents(dt) {
  eventTimer -= dt;
  if (eventTimer <= 0) { eventTimer = rand(28, 50); if (events.length < 2) spawnEvent(); }
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (!e.engaged) e.ttl -= dt;
    if (e.update) e.update(dt);
    if (e.done || e.ttl <= 0) { if (e.cleanup) e.cleanup(); events.splice(i, 1); }
  }
}
function finishEvent(e, xp, money, rep, label) { e.done = true; state.stats.events++; logEntry('⭐ ' + label); reward(xp, money, rep, label); }
function spawnEvent() {
  const t = pick(['dog', 'wallet', 'parker', 'speeder', 'help', 'help', 'parker']);
  const e = ({ dog: evDog, wallet: evWallet, parker: evParker, speeder: evSpeeder, help: evHelp })[t]();
  if (e) { events.push(e); toast(`❗ Zufallsereignis in der Nähe: ${e.title}`, 'mission'); }
}
function evDog() {
  const pp = playerPos();
  const lp = randomLanePoint(pp.x, pp.y, 320, 650); if (!lp) return null;
  const sp = randomSidewalkNear(lp.x, lp.y, 60, 260); if (!sp) return null;
  const dog = { type: 'dog', x: lp.x, y: lp.y, hx: lp.x, hy: lp.y, a: 0, t: 0, follow: false };
  animals.push(dog);
  const owner = makePed(sp.x, sp.y, null, { name: pick(['Frau Wuffke', 'Herr Bellmann', 'Oma Hilde']), face: '👵' });
  say(owner, 'Bello! BELLO! Komm zurück!', 999); peds.push(owner);
  return {
    title: 'Hund läuft auf der Straße', icon: '🐕', ttl: 100, x: dog.x, y: dog.y, dog, owner,
    update(dt) {
      if (!dog.follow) {
        dog.t -= dt; if (dog.t < 0) { dog.a = rand(0, 6.28); dog.t = rand(0.6, 1.6); }
        const nx = dog.x + Math.cos(dog.a) * 55 * dt, ny = dog.y + Math.sin(dog.a) * 55 * dt;
        if (Math.hypot(nx - dog.hx, ny - dog.hy) < 110 && !hitSolid(nx, ny, 6)) { dog.x = nx; dog.y = ny; } else dog.a += Math.PI;
        this.x = dog.x; this.y = dog.y;
        if (onFootNear(dog, 28)) { dog.follow = true; this.engaged = true; toast('Hund eingefangen! Bring ihn zurück zum Frauchen.', 'mission'); say(owner, 'Da ist er ja!', 3); sfx('whistle'); }
      } else {
        this.x = owner.x; this.y = owner.y;
        const d = dist(dog, P);
        if (d > 32) { const a = Math.atan2(P.y - dog.y, P.x - dog.x), sp = Math.min(230, d * 3); dog.x += Math.cos(a) * sp * dt; dog.y += Math.sin(a) * sp * dt; dog.a = a; }
        if (dist(dog, owner) < 55 || onFootNear(owner, 50)) {
          say(owner, 'Danke, Herr Wachtmeister! Bello, böser Hund! ...Guter Hund!', 4);
          finishEvent(this, 45, 15, 5, 'Hund zurückgebracht');
        }
      }
    },
    cleanup() { const i = animals.indexOf(dog); if (i >= 0) animals.splice(i, 1); owner.removeT = 5; }
  };
}
function evWallet() {
  const pp = playerPos();
  const sp = randomSidewalkNear(pp.x, pp.y, 220, 500); if (!sp) return null;
  const op = randomSidewalkNear(sp.x, sp.y, 300, 750); if (!op) return null;
  const owner = makePed(op.x, op.y, null, { name: randomName(), face: '😟' });
  peds.push(owner);
  return {
    title: 'Verlorenes Portemonnaie', icon: '👛', ttl: 110, x: sp.x, y: sp.y, phase: 0, wallet: { x: sp.x, y: sp.y }, owner,
    hint() {
      if (this.phase === 0 && onFootNear(this.wallet, 34)) return { label: 'Portemonnaie aufheben', act: () => {
        this.phase = 1; this.engaged = true; P.carry = this; this.x = owner.x; this.y = owner.y;
        say(owner, 'Wo ist nur mein Portemonnaie?', 999);
        toast(`Im Portemonnaie: Ausweis von ${owner.name}. Bring es zurück (oder zum Empfang im Revier).`, 'mission');
      } };
      if (this.phase === 1 && onFootNear(owner, 50)) return { label: 'Portemonnaie zurückgeben', act: () => {
        owner.bubbleT = 0;
        dialog([ME('Gehört das hier Ihnen?'), { who: owner.name, face: '🤩', text: 'Mein Portemonnaie! Mit allen 47 Treuepunkte-Karten! Möchten Sie Finderlohn?', choices: [
          { t: 'Nein danke, gern geschehen!', fn: () => { P.carry = null; finishEvent(this, 40, 0, 5, 'Fundsache zurückgegeben'); } },
          { t: 'Na gut, 5 € für die Kaffeekasse', fn: () => { P.carry = null; finishEvent(this, 40, 5, 2, 'Fundsache zurückgegeben'); } }
        ] }]);
      } };
      return null;
    },
    deliverAtStation() { P.carry = null; finishEvent(this, 35, 0, 3, 'Fundsache abgegeben'); },
    cleanup() { owner.bubbleT = 0; owner.removeT = 2; if (P.carry === this) P.carry = null; }
  };
}
function evParker() {
  const pp = playerPos();
  const lp = randomLanePoint(pp.x, pp.y, 280, 650, true, 44); if (!lp) return null;
  if (hitSolid(lp.x, lp.y, 14)) return null;
  const car = addParked(lp.x, lp.y, lp.a, pick(CAR_COLORS));
  const excuses = ['Ich bin nur ganz kurz Brötchen holen! Seit zwei Stunden.', 'Halb auf dem Gehweg ist doch auch nur halb falsch!', 'Mein Auto parkt sich selbst. Es hat das so entschieden.', 'Da stand kein Schild! ...Das Schild direkt daneben zählt nicht.'];
  return {
    title: 'Falschparker', icon: '🅿️', ttl: 120, x: car.x, y: car.y, car,
    hint() {
      if (!onFootNear(car, 62)) return null;
      return { label: 'Falschparker kontrollieren', act: () => {
        const who = randomName(), face = pick(FACES);
        dialog([{ who, face, text: '*kommt angerannt* Moment, Moment! ' + pick(excuses), choices: [
          { t: '📝 Strafzettel ausstellen', fn: () => { state.stats.tickets++; finishEvent(this, 40, 15, 1, 'Falschparker verwarnt'); return [{ who, face, text: 'Na toll. Dann fahr ich jetzt eben weg. Ordentlich!' }]; } },
          { t: '😌 Ein Auge zudrücken – sofort wegfahren!', fn: () => { finishEvent(this, 30, 5, 4, 'Falschparker ermahnt'); return [{ who, face, text: 'Danke! Sie sind der netteste Polizist der Welt!' }]; } }
        ] }]);
      } };
    },
    cleanup() { removeParked(car); }
  };
}
function evSpeeder() {
  const c = pickRoadCar(250, 800); if (!c) return null;
  c.speeder = true; c.speedMul = 1.9; c.special = true;
  return {
    title: 'Raser! (Mit Sirene verfolgen)', icon: '💨', ttl: 35, x: c.x, y: c.y, car: c,
    update() {
      this.x = c.x; this.y = c.y;
      if (P.car && P.car.siren && dist(P.car, c) < 210) {
        if (mission) { if (!this.warned) { this.warned = true; toast('Erst den aktuellen Einsatz beenden!', 'bad'); } return; }
        this.done = true; state.stats.events++;
        c.speedMul = 1;
        startMission(createTraffic({ car: c, outcome: 'speed' }));
      }
    },
    cleanup() { if (!mission || mission.car !== c) { c.speeder = false; c.speedMul = 1; c.special = false; } }
  };
}
function evHelp() {
  const pp = playerPos();
  const sp = randomSidewalkNear(pp.x, pp.y, 250, 600); if (!sp) return null;
  const p = makePed(sp.x, sp.y, null, { name: randomName(), face: pick(FACES) });
  say(p, 'Hilfe! Hallo? Polizei!', 999); peds.push(p);
  const sc = pick(HELP_SCENARIOS);
  return {
    title: 'Person braucht Hilfe', icon: '🙋', ttl: 120, x: p.x, y: p.y, p,
    hint() {
      if (!onFootNear(p, 50)) return null;
      return { label: `${p.name} helfen`, act: () => {
        p.bubbleT = 0;
        dialog([ME('Polizei! Wie kann ich helfen?'), { who: p.name, face: p.face, text: sc.text, choices: sc.choices.map(c => ({ t: c.t, fn: () => { finishEvent(this, c.xp, c.money, c.rep, 'Bürger geholfen'); return [{ who: 'Andreas Neunkirch', face: '👮', text: c.res }]; } })) }]);
      } };
    },
    cleanup() { p.bubbleT = 0; p.removeT = 4; }
  };
}

// ============================== EASTER EGGS & ORTE ==============================
function talkStationParker() {
  if (stationParkerCd > 0 || !stationParker) return;
  dialog([ME('Sie wissen schon, dass Sie direkt vor der Polizeistation parken? Im Halteverbot?'), { who: 'Herr Dreist', face: '😏', text: 'Ich bin nur ganz kurz drin!' }, ME('Sie sind gar nicht drin. Sie sitzen im Auto.'), { who: 'Herr Dreist', face: '😏', text: '...Ich bin innerlich drin.', choices: [
    { t: '📝 Strafzettel. Und Tschüss.', fn: () => { state.stats.tickets++; reward(30, 10, 1, 'Revier-Falschparker'); removeStationParker(); return [{ who: 'Herr Dreist', face: '😤', text: 'Ich komme wieder! Morgen! Gleiche Stelle!' }]; } },
    { t: '😑 Bitte einfach wegfahren.', fn: () => { reward(20, 0, 3, 'Revier-Falschparker'); removeStationParker(); return [{ who: 'Herr Dreist', face: '😇', text: 'Für Sie doch immer, Andreas!' }]; } }
  ] }]);
}
function removeStationParker() { if (stationParker) { removeParked(stationParker); stationParker = null; stationParkerCd = 240; } }
function setupInteractables() {
  const add = (id, label, act, r = 42) => { const p = pois[id]; if (p) interactables.push({ x: p.x, y: p.y, r, label, act }); };
  add('donut', 'Donut kaufen (3 €)', () => { if (state.money < 3) { toast('Zu wenig Geld für einen Donut. Tragisch.', 'bad'); return; } state.money -= 3; P.stamina = 100; toast('🍩 Donut gegessen! Ausdauer voll. Klischee erfüllt.', 'good'); sfx('coin'); });
  add('gas', 'Kaffee kaufen (2 €)', () => { if (state.money < 2) { toast('Zu wenig Geld.', 'bad'); return; } state.money -= 2; P.stamina = 100; toast('☕ Tankstellenkaffee. Schmeckt nach Benzin, wirkt aber.', 'good'); sfx('coin'); });
  add('bank', 'Geldautomat benutzen', () => dialog([{ who: 'Geldautomat', face: '🏧', text: `Kontostand: ${fmtMoney(state.money)}. Der Automat lacht leise.` }]));
  add('hospital', 'Krankenhaus betreten', () => dialog([{ who: 'Dr. Pflaster', face: '🧑‍⚕️', text: 'Sie sehen kerngesund aus. Bitte gehen Sie, wir haben zu tun.' }]));
  add('fire', 'Feuerwache besuchen', () => dialog([{ who: 'Brandmeister Löschke', face: '🧑‍🚒', text: 'Andreas! Willst du mitspielen? Tischkicker, Feuerwehr gegen Polizei. Wir führen 47 zu 3.' }]));
  add('kino', 'Kinoprogramm ansehen', () => dialog([{ who: 'Kinokasse', face: '🎬', text: 'Heute: „Der Falschparker 3 – Diesmal ist es persönlich". Danach: „Die Taube, die zu viel wusste".' }]));
  add('rathaus', 'Rathaus betreten', () => dialog([{ who: 'Bürgermeister Wichtig', face: '🎩', text: 'Andreas! Weiter so! Die Stadt ist sicher, die Tauben sind... weitgehend unter Kontrolle.' }]));
  add('pond', 'Enten beobachten', () => { sfx('quack'); dialog([{ who: 'Ente', face: '🦆', text: 'Quak. (Die Ente hat Ihren Ausweis kontrolliert und nickt zufrieden.)' }]); }, 60);
  add('icecream', 'Eis kaufen (2 €)', () => { if (state.money < 2) { toast('Zu wenig Geld.', 'bad'); return; } state.money -= 2; P.stamina = 100; toast('🍦 Stracciatella! Ausdauer voll.', 'good'); });
  add('supermarket', 'Supermarkt betreten', () => dialog([{ who: 'Durchsage', face: '📢', text: 'Liebe Kunden, die Gratisproben sind leider aus. Ein Herr hat 30 Stück gegessen. Wir wissen, wer Sie sind.' }]));
  const st = props.find(p => p.type === 'statue');
  if (st) interactables.push({ x: st.x, y: st.y + 22, r: 44, label: 'Denkmal lesen', act: () => dialog([{ who: 'Gedenktafel', face: '🗿', text: 'Zu Ehren von Horst Pfefferle, der 1987 als erster Bürger Neunkirchhausens korrekt eingeparkt hat. Er wird nie vergessen.' }]) });
  const bb = props.find(p => p.type === 'billboard');
  if (bb) interactables.push({ x: bb.x, y: bb.y + 40, r: 60, label: 'Plakat lesen', act: () => toast('„Hier könnte Ihre Werbung stehen." Steht aber was anderes da. Verwirrend.') });
}

// ============================== SPIELER ==============================
const keys = {};
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0, mag: 0 };
let touchSprint = false, crashCd = 0, dodgeCd = 0;
function playerPos() { return P.car ? P.car : P; }

function carCircles(x, y, a, l, w) {
  const off = Math.max(0, l / 2 - w / 2), c = Math.cos(a), s = Math.sin(a);
  return [[x + c * off, y + s * off], [x - c * off, y - s * off], [x, y]];
}
function carHits(x, y, a, car) {
  const r = car.w / 2;
  for (const [cx, cy] of carCircles(x, y, a, car.l, car.w)) if (hitSolid(cx, cy, r)) return true;
  return false;
}
function carsOverlap(A, B) {
  const ca = carCircles(A.x, A.y, A.a, A.l, A.w), cb = carCircles(B.x, B.y, B.a, B.l, B.w), rs = A.w / 2 + B.w / 2;
  for (const [ax, ay] of ca) for (const [bx, by] of cb) if ((ax - bx) ** 2 + (ay - by) ** 2 < rs * rs) return true;
  return false;
}
function pointHitsCar(x, y, r, except) {
  for (const c of cars) {
    if (c === except || Math.abs(c.x - x) > 60 || Math.abs(c.y - y) > 60) continue;
    for (const [cx, cy] of carCircles(c.x, c.y, c.a, c.l, c.w)) if ((cx - x) ** 2 + (cy - y) ** 2 < (r + c.w / 2) ** 2) return c;
  }
  for (const c of parked) {
    if (Math.abs(c.x - x) > 60 || Math.abs(c.y - y) > 60) continue;
  }
  return null;
}

function updatePlayer(dt) {
  if (P.car) { updatePlayerCar(P.car, dt); P.x = P.car.x; P.y = P.car.y; return; }
  let mx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  let my = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (joy.active && joy.mag > 0.12) { mx = joy.x; my = joy.y; }
  const len = Math.hypot(mx, my);
  if (len > 1) { mx /= len; my /= len; }
  const wantSprint = (keys.shift || touchSprint) && len > 0.1;
  let speed = 150 * Math.min(1, Math.max(len, joy.active ? 0.35 : 1));
  if (wantSprint && !P.exhausted) {
    speed = 250 * (hasEquip('shoes') ? 1.2 : 1);
    P.stamina -= 20 * dt;
    if (P.stamina <= 0) { P.stamina = 0; P.exhausted = true; say(P, '*keuch*', 1.5); }
  } else {
    P.stamina = Math.min(100, P.stamina + (hasEquip('thermos') ? 26 : 13) * dt);
    if (P.exhausted && P.stamina > 30) P.exhausted = false;
  }
  if (len > 0.08) {
    const vx = mx * speed * dt, vy = my * speed * dt;
    if (!hitSolid(P.x + vx, P.y, 10) && !pointHitsCar(P.x + vx, P.y, 10)) P.x += vx;
    if (!hitSolid(P.x, P.y + vy, 10) && !pointHitsCar(P.x, P.y + vy, 10)) P.y += vy;
    P.a = Math.atan2(my, mx); P.moving = true; P.step += dt * speed * 0.09;
  } else P.moving = false;
  // von fahrenden Autos weggeschoben werden
  const c = pointHitsCar(P.x, P.y, 9);
  if (c) { const a = Math.atan2(P.y - c.y, P.x - c.x), nx = P.x + Math.cos(a) * 3, ny = P.y + Math.sin(a) * 3; if (!hitSolid(nx, ny, 10)) { P.x = nx; P.y = ny; } }
}
function updatePlayerCar(car, dt) {
  const spec = car.spec;
  let thr = 0, steer = 0;
  if (joy.active && joy.mag > 0.15) {
    const desired = Math.atan2(joy.y, joy.x), d = angDiff(car.a, desired);
    if (Math.abs(d) > 2.3 && car.v < 80) { thr = -joy.mag; steer = 0; }
    else { thr = joy.mag; steer = clamp(d * 2.2, -1, 1) * (car.v < 0 ? -1 : 1); }
  } else {
    thr = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
    steer = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0);
  }
  const onRoadish = roads.some(r => car.x > r.x && car.x < r.x + r.w && car.y > r.y && car.y < r.y + r.h) || sideRoads.some(r => car.x > r.x && car.x < r.x + r.w && car.y > r.y && car.y < r.y + r.h);
  const maxV = spec.max * (onRoadish ? 1 : 0.75);
  if (thr > 0) car.v += (car.v < 0 ? spec.acc * 2.2 : spec.acc * thr) * dt;
  else if (thr < 0) car.v += (car.v > 0 ? -spec.acc * 2.2 : spec.acc * 0.6 * thr) * dt;
  else { const f = 260 * dt; car.v = Math.abs(car.v) < f ? 0 : car.v - Math.sign(car.v) * f; }
  if (car.v > maxV) car.v = Math.max(maxV, car.v - spec.acc * 1.5 * dt);
  car.v = clamp(car.v, -spec.max * 0.35, spec.max);
  const sf = clamp(Math.abs(car.v) / 140, 0, 1) * Math.sign(car.v) * (1 - clamp(Math.abs(car.v) / spec.max, 0, 1) * 0.35);
  const na = car.a + steer * spec.turn * sf * dt;
  if (!carHits(car.x, car.y, na, car)) car.a = na;
  const nx = car.x + Math.cos(car.a) * car.v * dt, ny = car.y + Math.sin(car.a) * car.v * dt;
  if (!carHits(nx, ny, car.a, car)) { car.x = nx; car.y = ny; }
  else if (!carHits(nx, car.y, car.a, car)) { car.x = nx; car.v *= 0.92; }
  else if (!carHits(car.x, ny, car.a, car)) { car.y = ny; car.v *= 0.92; }
  else { if (Math.abs(car.v) > 140) { sfx('bump'); shake = 6; } car.v *= -0.3; }
  state.stats.distance += Math.abs(car.v) * dt / 10;
  // Kollision mit anderen Autos
  for (const o of cars) {
    if (o === car || Math.abs(o.x - car.x) > 90 || Math.abs(o.y - car.y) > 90) continue;
    if (!carsOverlap(car, o)) continue;
    const dx = car.x - o.x, dy = car.y - o.y, L = Math.hypot(dx, dy) || 1;
    const px = car.x + dx / L * 5, py = car.y + dy / L * 5;
    if (!carHits(px, py, car.a, car)) { car.x = px; car.y = py; }
    const impact = Math.abs(car.v);
    car.v *= 0.5;
    if (o.state === 'flee' && mission && mission.onBump) { mission.onBump(o); o.v *= 0.6; sfx('bump'); shake = 8; }
    else if (impact > 130 && crashCd <= 0) {
      crashCd = 2.5; sfx('bump'); shake = 7; state.stats.crashes++;
      say(o, pick(['Hey! Mein Lack!', 'Aua, mein Auto!', 'Das zahlt die Polizei!', 'Ich sag\'s meiner Mama!']), 2.5);
      if (o.ai && o.state === 'drive') o.stunT = 1.2;
      loseRep(1, 'Blechschaden');
    }
  }
  // Fußgänger weichen aus
  if (Math.abs(car.v) > 40) for (const p of peds) {
    if (Math.abs(p.x - car.x) > 50 || Math.abs(p.y - car.y) > 50) continue;
    for (const [cx, cy] of carCircles(car.x, car.y, car.a, car.l, car.w)) {
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < car.w / 2 + 10) {
        const side = Math.sign((p.x - car.x) * -Math.sin(car.a) + (p.y - car.y) * Math.cos(car.a)) || 1;
        const nx2 = p.x - Math.sin(car.a) * side * 26, ny2 = p.y + Math.cos(car.a) * side * 26;
        if (!hitSolid(nx2, ny2, 8)) { p.x = nx2; p.y = ny2; }
        if (dodgeCd <= 0) { dodgeCd = 2.5; say(p, pick(DODGE_LINES), 2); if (Math.abs(car.v) > 200) loseRep(1, 'Fußgänger erschreckt'); }
        break;
      }
    }
  }
}
function exitCar() {
  const car = P.car, c = Math.cos(car.a), s = Math.sin(car.a);
  const opts = [[s, -c, car.w / 2 + 16], [-s, c, car.w / 2 + 16], [-c, -s, car.l / 2 + 16], [c, s, car.l / 2 + 16]];
  for (const [ox, oy, d] of opts) {
    const x = car.x + ox * d, y = car.y + oy * d;
    if (!hitSolid(x, y, 10) && !pointHitsCar(x, y, 10)) { P.x = x; P.y = y; P.car = null; car.v = 0; sfx('door'); return; }
  }
  toast('Hier kannst du nicht aussteigen.', 'bad');
}
function actEnter() {
  if (P.car) { if (Math.abs(P.car.v) > 90) { toast('Erst langsamer werden!', 'bad'); return; } exitCar(); }
  else if (policeCar && dist(P, policeCar) < 75) { P.car = policeCar; sfx('door'); }
  else toast('Kein Fahrzeug in der Nähe. Dein Streifenwagen ist auf der Minimap blau markiert.');
}
function actSiren() {
  if (P.car) { P.car.siren = !P.car.siren; toast(P.car.siren ? '🚨 Sirene & Blaulicht AN' : 'Sirene aus'); return; }
  if (P.shoutCd > 0) return;
  P.shoutCd = 1.5; say(P, 'Halt! Polizei!', 1.6); sfx('whistle');
  for (const p of peds) {
    const d = dist(p, P); if (d > 320) continue;
    if (p.state === 'flee') { p.shout = 0.9; say(p, 'Iiiih!', 1.2); }
    else if (d < 200 && Math.random() < 0.4) say(p, pick(['Huch!', 'Ich war\'s nicht!', 'Wer, ich?']), 1.6);
  }
}
function findInteraction() {
  if (P.car) return null;
  if (mission && mission.interactHint) { const h = mission.interactHint(); if (h) return h; }
  for (const e of events) if (e.hint) { const h = e.hint(); if (h) return h; }
  for (const c of cars) if (c.talk && onFootNear(c, 60)) return { label: `${c.name} ansprechen`, act: () => dialog([{ who: c.name, face: '👴', text: 'Junger Mann, die Straße ist frei! Da kann man sich doch Zeit lassen. Ich fahre seit 1962 unfallfrei. Meistens.' }, ME('Sie fahren 12 km/h auf der Autobahn.'), { who: c.name, face: '👴', text: 'Eben! Unfallfrei!' }]) };
  for (const it of interactables) if ((!it.cond || it.cond()) && onFootNear(it, it.r)) return it;
  let best = null, bd = 40;
  for (const p of peds) { if (p.removeT || p.state === 'flee') continue; const d = dist(p, P); if (d < bd) { bd = d; best = p; } }
  if (best) return { label: `Mit ${best.name} sprechen`, act: () => talkPed(best) };
  return null;
}
function actInteract() {
  if (P.car) { toast('Steig zuerst aus (E).'); return; }
  const h = findInteraction(); if (h) h.act();
}
function talkPed(p) {
  p.wait = 4; p.a = Math.atan2(P.y - p.y, P.x - p.x); p.bubbleT = 0;
  if (p.cop) {
    const lines = { reception: 'Hallo Andreas! Für Fundsachen und Kaffee bin ich zuständig. Für alles andere auch, ehrlich gesagt.', chief: `Neunkirch! ${canPromote() ? 'Ich hab gute Nachrichten für Sie – kommen Sie ins Büro!' : 'Weiter so. Und lassen Sie die Tauben in Ruhe.'}`, colleague: 'Hey Andreas! An der Einsatztafel hängen neue Aufträge. Und jemand hat wieder meinen Joghurt gegessen.' };
    dialog([{ who: p.name, face: p.face, text: lines[p.role] || 'Hallo Kollege!' }]); return;
  }
  if (!p.didNothing && Math.random() < 0.2) {
    p.didNothing = true;
    dialog([{ who: p.name, face: p.face, text: 'Ich habe wirklich nichts gemacht!' }, ME('Ich habe noch gar nichts gesagt.'), { who: p.name, face: p.face, text: '...' }]);
    return;
  }
  dialog([{ who: p.name, face: p.face, text: pick(PED_GREETINGS), choices: [
    { t: '🪪 Personenkontrolle', fn: () => checkPed(p) },
    { t: '💬 Plaudern', fn: () => [{ who: p.name, face: p.face, text: pick(PED_SMALLTALK) }] },
    { t: '👋 Schönen Tag noch!', fn: () => [{ who: p.name, face: p.face, text: pick(['Ihnen auch!', 'Tschüssi!', 'Passen Sie auf sich auf!']) }] }
  ] }]);
}
function checkPed(p) {
  if (p.checked) return [{ who: p.name, face: p.face, text: 'Sie haben mich doch eben schon kontrolliert! Ich bin immer noch ich.' }];
  p.checked = true; state.stats.checks++;
  const r = Math.random(), res = r < 0.6 ? pick(CHECK_OK) : r < 0.85 ? pick(CHECK_FUNNY) : pick(CHECK_ISSUE);
  reward(10, 0, res.rep, 'Personenkontrolle');
  return [{ who: p.name, face: p.face, text: res.text }, ME(res.reply)];
}

// ============================== KI-UPDATES ==============================
function nextEdge(c) {
  const n = nodes[c.to];
  let opts = n.links.filter(id => id !== c.from);
  if (c.hwOnly) { const h = opts.filter(id => nodes[id].hw); opts = h.length ? h : [c.from]; }
  if (!opts.length) opts = n.links.slice();
  let nx;
  if (c.state === 'flee') {
    const pp = playerPos();
    nx = opts.map(id => ({ id, s: Math.hypot(nodes[id].x - pp.x, nodes[id].y - pp.y) + rand(0, 700) - (nodes[id].end ? 2000 : 0) })).sort((a, b) => b.s - a.s)[0].id;
  } else nx = pick(opts);
  c.from = c.to; c.to = nx;
  c.wp = lanePts(c.from, c.to);
}
function obstacleAhead(c) {
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  let minS = Infinity;
  const check = (x, y, range) => {
    const dx = x - c.x, dy = y - c.y, fwd = dx * fx + dy * fy;
    if (fwd <= 8 || fwd > range) return;
    if (Math.abs(-dx * fy + dy * fx) > 16) return;
    const s = Math.max(0, fwd - c.l / 2 - 30) * 3; if (s < minS) minS = s;
  };
  for (const o of cars) if (o !== c && Math.abs(o.x - c.x) < 130 && Math.abs(o.y - c.y) < 130) check(o.x, o.y, 75 + c.l / 2);
  if (!P.car) check(P.x, P.y, 80);
  for (const a of animals) if (a.type === 'dog') check(a.x, a.y, 100);
  return minS === Infinity ? null : minS;
}
function updateAICar(c, dt) {
  if (c.bubbleT > 0) c.bubbleT -= dt;
  if (c.pending) { c.pending.delay -= dt; if (c.pending.delay <= 0) { c.bubble = c.pending.text; c.bubbleT = c.pending.dur; c.pending = null; } }
  if (c.state === 'stopped' || c.state === 'wreck') { c.v = 0; return; }
  if (c.stunT > 0) { c.stunT -= dt; c.v *= 0.9; return; }
  let tx, ty;
  if (c.state === 'pull') {
    tx = c.pullTo.x; ty = c.pullTo.y;
    const d = Math.hypot(tx - c.x, ty - c.y);
    if (d < 10) { c.state = 'stopped'; c.v = 0; return; }
    const ad = angDiff(c.a, Math.atan2(ty - c.y, tx - c.x));
    c.a += clamp(ad, -2.5 * dt, 2.5 * dt);
    c.v += clamp(Math.min(110, d * 2) - c.v, -400 * dt, 200 * dt);
    c.x += Math.cos(c.a) * c.v * dt; c.y += Math.sin(c.a) * c.v * dt;
    return;
  }
  if (!c.wp.length) nextEdge(c);
  const t = c.wp[0];
  const dx = t.x - c.x, dy = t.y - c.y, d = Math.hypot(dx, dy);
  const ad = angDiff(c.a, Math.atan2(dy, dx));
  if (d < 14 || (d < 45 && Math.abs(ad) > 1.3)) { c.wp.shift(); return; }
  const turn = c.state === 'flee' ? 3.8 : 3.2;
  c.a += clamp(ad, -turn * dt, turn * dt);
  let target = c.maxV * c.speedMul;
  if (c.slowT > 0) { c.slowT -= dt; target *= 0.45; }
  if (Math.abs(ad) > 0.45) target *= c.state === 'flee' ? 0.55 : 0.42;
  if (c.state !== 'flee') {
    if (c.ghostT > 0) c.ghostT -= dt;
    else {
      const ob = obstacleAhead(c);
      if (ob != null) { target = Math.min(target, ob); if (ob < 20) { c.waitT += dt; if (c.waitT > 4) { c.ghostT = 1.6; c.waitT = 0; } } } else c.waitT = 0;
    }
    // Platz machen für Blaulicht
    if (policeCar && policeCar.siren && P.car === policeCar && Math.abs(policeCar.x - c.x) < 260 && Math.abs(policeCar.y - c.y) < 260) {
      const bx = c.x - policeCar.x, by = c.y - policeCar.y;
      if (bx * Math.cos(policeCar.a) + by * Math.sin(policeCar.a) > 0 && Math.hypot(bx, by) < 240) {
        target = Math.min(target, c.opa ? 20 : 80);
        if (!c.yieldSaid && Math.random() < 0.02) { c.yieldSaid = true; say(c, c.opa ? 'Ich fahr so schnell ich will! Also 12 km/h.' : pick(['Oh, Blaulicht!', 'Ich mach ja schon Platz!', 'Huch!']), 2.2); }
      }
    }
  }
  c.v += clamp(target - c.v, -520 * dt, 240 * dt);
  c.x += Math.cos(c.a) * c.v * dt; c.y += Math.sin(c.a) * c.v * dt;
}
function updatePed(p, dt) {
  if (p.bubbleT > 0) p.bubbleT -= dt;
  if (p.pending) { p.pending.delay -= dt; if (p.pending.delay <= 0) { p.bubble = p.pending.text; p.bubbleT = p.pending.dur; p.pending = null; } }
  p.cool -= dt;
  if (p.state === 'flee') { updateFleePed(p, dt); return; }
  // Reaktion auf Sirene
  if (policeCar && policeCar.siren && Math.abs(policeCar.v) > 30 && p.cool <= 0 && !p.cop && Math.abs(p.x - policeCar.x) < 140 && Math.abs(p.y - policeCar.y) < 140) { p.cool = 14; if (Math.random() < 0.6) say(p, pick(SIREN_LINES), 2); }
  if (p.state === 'static' || !p.area) { p.moving = false; if (dist(p, P) < 90) p.a = Math.atan2(P.y - p.y, P.x - p.x); return; }
  if (p.wait > 0) { p.wait -= dt; p.moving = false; return; }
  const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy);
  if (d < 6) { p.wait = rand(0.5, 4.5); newPedTarget(p); return; }
  const nx = p.x + dx / d * p.speed * dt, ny = p.y + dy / d * p.speed * dt;
  if (hitSolid(nx, ny, 8) || pointHitsCar(nx, ny, 8) || (!P.car && Math.hypot(nx - P.x, ny - P.y) < 18)) { p.blocked = (p.blocked || 0) + dt; p.moving = false; if (p.blocked > 0.5) { newPedTarget(p); p.blocked = 0; } return; }
  p.x = nx; p.y = ny; p.a = Math.atan2(dy, dx); p.moving = true; p.step += dt * p.speed * 0.12;
}
function newPedTarget(p) {
  const A = p.area;
  for (let k = 0; k < 12; k++) {
    const x = rand(A.x + 10, A.x + A.w - 10), y = rand(A.y + 10, A.y + A.h - 10);
    if (!hitSolid(x, y, 10)) { p.tx = x; p.ty = y; return; }
  }
}
const FLEE_OFFS = [0, 0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.45, -1.45, 1.9, -1.9, 2.4, -2.4, 3.0];
function updateFleePed(p, dt) {
  if (p.pause > 0) { p.pause -= dt; p.moving = false; return; }
  p.runT -= dt;
  if (p.runT <= 0) { p.runT = rand(5, 8); p.pause = rand(0.7, 1.2); say(p, pick(['*keuch* Puh...', 'Seitenstechen!', 'Nur kurz verschnaufen...']), 1.4); return; }
  let sp = p.fleeSpeed;
  if (p.shout > 0) { p.shout -= dt; sp *= 0.4; }
  const base = Math.atan2(p.y - P.y, p.x - P.x) + Math.sin(performance.now() / 700 + p.x) * 0.25;
  for (const off of FLEE_OFFS) {
    const a = base + off, lx = p.x + Math.cos(a) * 22, ly = p.y + Math.sin(a) * 22;
    if (!hitSolid(lx, ly, 9) && !pointHitsCar(lx, ly, 9)) {
      const nx = p.x + Math.cos(a) * sp * dt, ny = p.y + Math.sin(a) * sp * dt;
      if (!hitSolid(nx, ny, 8)) { p.x = nx; p.y = ny; p.a = a; p.moving = true; p.step += dt * sp * 0.12; }
      return;
    }
  }
}
let chatterT = 3, idleT = 2;
function updateChatter(dt) {
  chatterT -= dt; idleT -= dt;
  if (chatterT <= 0) {
    chatterT = rand(2, 4);
    const near = peds.filter(p => p.area && !p.cop && p.state === 'walk' && dist(p, P) < 800);
    for (let k = 0; k < 8 && near.length; k++) {
      const a = pick(near), b = near.find(q => q !== a && dist(q, a) < 70);
      if (b && a.bubbleT <= 0 && b.bubbleT <= 0) {
        const [l1, l2] = pick(CHATTER);
        a.wait = b.wait = 5; a.a = Math.atan2(b.y - a.y, b.x - a.x); b.a = a.a + Math.PI;
        say(a, l1, 2.6); say(b, l2, 2.8, 2.2); break;
      }
    }
  }
  if (idleT <= 0) {
    idleT = rand(3, 6);
    const near = peds.filter(p => p.area && !p.cop && p.bubbleT <= 0 && dist(p, P) < 550);
    if (near.length) say(pick(near), pick(IDLE_LINES), 2.5);
  }
}
function updateAnimals(dt) {
  for (let i = animals.length - 1; i >= 0; i--) {
    const a = animals[i];
    if (a.type === 'duck') {
      a.t -= dt; if (a.t < 0) { a.t = rand(1, 4); a.a = rand(0, 6.28); }
      const nx = a.x + Math.cos(a.a) * 14 * dt, ny = a.y + Math.sin(a.a) * 14 * dt;
      if (((nx - PARK.pcx) / 125) ** 2 + ((ny - PARK.pcy) / 70) ** 2 < 1) { a.x = nx; a.y = ny; } else a.a += Math.PI;
    } else if (a.type === 'pigeon') {
      const near = dist(a, playerPos()) < (P.car ? 110 : 55);
      if (a.fly > 0) {
        a.fly -= dt; a.x += Math.cos(a.a) * 160 * dt; a.y += Math.sin(a.a) * 160 * dt;
        if (a.fly <= 0) { if (a.remove) { animals.splice(i, 1); continue; } a.x = a.hx + rand(-30, 30); a.y = a.hy + rand(-15, 15); }
      } else if (near && !a.stubborn) { a.fly = rand(1.5, 2.5); a.a = Math.atan2(a.y - P.y, a.x - P.x) + rand(-0.6, 0.6); }
      else if (Math.random() < 0.02) { a.x += rand(-6, 6); a.y += rand(-4, 4); }
    }
  }
}

// ============================== POLIZEISTATION UI ==============================
let stationOpen = false, stationTab = 'reception', settingsOpen = false;
const TABS = [['reception', '🛎️ Empfang'], ['office', '🗂️ Büro'], ['board', '📋 Einsatztafel'], ['garage', '🚓 Garage'], ['locker', '👕 Umkleide']];
function openStation(tab) { stationTab = tab; stationOpen = true; $('station').classList.remove('hidden'); renderStation(); sfx('door'); }
function closeStation() { stationOpen = false; $('station').classList.add('hidden'); save(); }
function renderStation() {
  $('stTabs').innerHTML = TABS.map(([k, n]) => `<button data-tab="${k}" class="${k === stationTab ? 'on' : ''}">${n}</button>`).join('');
  let h = '';
  const nextR = RANKS[state.rank + 1];
  if (stationTab === 'reception') {
    const wallet = events.find(e => P.carry === e);
    h += `<div class="npcline">Frau Beckmann: „${esc(pick(['Guten Tag, Andreas! Kaffee ist frisch. Also, von heute Morgen.', 'Herr Dreist hat schon wieder vor der Tür geparkt. Ich habe aufgegeben.', 'Hier hat jemand angerufen, weil seine Nachbarin zu laut gähnt. Hab ich abgelehnt.', 'Schön, dass Sie da sind! Der Drucker ist kaputt. Wie immer.']))}"</div>`;
    h += `<div class="card"><div class="ico">☕</div><div class="txt"><b>Kaffee holen</b><small>Ausdauer sofort voll aufladen.</small></div><div class="act"><button data-a="coffee" ${state.money < 2 ? 'disabled' : ''}>2 €</button></div></div>`;
    h += `<div class="card ${wallet ? '' : 'locked'}"><div class="ico">👛</div><div class="txt"><b>Fundsache abgeben</b><small>${wallet ? 'Du trägst ein gefundenes Portemonnaie bei dir.' : 'Gefundene Portemonnaies kannst du hier abgeben.'}</small></div><div class="act"><button data-a="lost" ${wallet ? '' : 'disabled'}>Abgeben</button></div></div>`;
    h += `<div class="card"><div class="ico">📖</div><div class="txt"><b>Beschwerdebuch lesen</b><small id="complaint">Die besten Anrufe der Woche.</small></div><div class="act"><button data-a="complaint" class="ghost">Lesen</button></div></div>`;
  } else if (stationTab === 'office') {
    const pr = nextR ? clamp((state.xp - RANKS[state.rank].xp) / (nextR.xp - RANKS[state.rank].xp), 0, 1) : 1;
    h += `<div class="card"><div class="ico">🎖️</div><div class="txt"><b>${RANKS[state.rank].name}</b><small>Rang ${state.rank + 1} von ${RANKS.length}</small>
      <div class="bar" style="margin-top:6px"><div style="width:${pr * 100}%"></div></div>
      <small>${nextR ? `Nächster Rang: <b>${nextR.name}</b> – benötigt ${nextR.xp} XP (du: ${state.xp}) und ${nextR.rep} Ruf (du: ${state.rep})` : 'Höchster Rang erreicht. Respekt, Einsatzleiter!'}</small></div>
      <div class="act">${nextR ? `<button data-a="promote" ${canPromote() ? '' : 'disabled'}>Beförderung annehmen</button>` : ''}</div></div>`;
    h += `<div class="npcline">Hauptkommissar Brösel: „${canPromote() ? 'Neunkirch! Hervorragende Arbeit. Ich habe hier was für Sie.' : esc(pick(['Weiter so, Neunkirch. Und bringen Sie Donuts mit.', 'Die Statistik sieht gut aus. Fast so gut wie mein Schnurrbart.', 'Ein guter Polizist hört zu. Ein sehr guter Polizist hört auch den Tauben zu.']))}"</div>`;
    const s = state.stats;
    h += `<h3>📊 Statistik</h3><div class="grid2">
      <div class="stat"><b>${s.missions}</b>Einsätze</div><div class="stat"><b>${s.events}</b>Zufallsereignisse</div>
      <div class="stat"><b>${s.tickets}</b>Verwarnungen</div><div class="stat"><b>${s.chases}</b>Verfolgungen</div>
      <div class="stat"><b>${s.caught}</b>Gestellte</div><div class="stat"><b>${s.found}</b>Gefundene Personen</div>
      <div class="stat"><b>${s.checks}</b>Personenkontrollen</div><div class="stat"><b>${(s.distance / 1000).toFixed(1)} km</b>Gefahren</div>
      <div class="stat"><b>${s.crashes}</b>Blechschäden</div><div class="stat"><b>${Math.floor(s.playtime / 60)} min</b>Dienstzeit</div>
      <div class="stat"><b>${fmtMoney(state.money)}</b>Kontostand</div><div class="stat"><b>${state.rep}</b>Ruf</div></div>`;
    h += `<h3>✅ Abgeschlossene Einsätze</h3><div class="grid2">${Object.entries(MISSION_TYPES).map(([k, m]) => `<div class="stat"><b>${s.byType[k] || 0}</b>${m.icon} ${m.name}</div>`).join('')}<div class="stat"><b>${s.byType.visit || 0}</b>📞 Bürgereinsätze</div></div>`;
    h += `<h3>🗒️ Letzte Einträge</h3>${state.log.length ? state.log.map(l => `<div class="logline">${esc(l)}</div>`).join('') : '<div class="logline">Noch keine Einträge. Raus auf die Straße!</div>'}`;
  } else if (stationTab === 'board') {
    h += mission ? `<div class="npcline">Aktiver Einsatz: <b>${esc(mission.title)}</b>. Erst abschließen, dann gibt's Neues.</div>` : '<div class="npcline">Kollegin Yilmaz: „Such dir was aus. Aber nimm nicht wieder nur die mit den Tauben."</div>';
    for (const [k, m] of Object.entries(MISSION_TYPES)) {
      const locked = m.rank > state.rank;
      h += `<div class="card ${locked ? 'locked' : ''}"><div class="ico">${m.icon}</div><div class="txt"><b>${m.name}</b><small>${m.desc}</small>
        <span class="tag g">+${m.xp} XP</span><span class="tag g">+${fmtMoney(m.money)}</span>${locked ? `<span class="tag">🔒 ab ${RANKS[m.rank].name}</span>` : ''}</div>
        <div class="act"><button data-a="start" data-v="${k}" ${locked || mission ? 'disabled' : ''}>Starten</button></div></div>`;
    }
    h += `<div class="card"><div class="ico">📞</div><div class="txt"><b>Bürgereinsatz</b><small>Ein zufälliger Anruf aus der Bevölkerung. Meist absurd.</small><span class="tag g">+60–80 XP</span></div><div class="act"><button data-a="start" data-v="visit" ${mission ? 'disabled' : ''}>Starten</button></div></div>`;
  } else if (stationTab === 'garage') {
    h += '<div class="npcline">Mechaniker Schrauber: „Der Wagen steht draußen vor dem Garagentor. Bitte nicht wieder in den Teich fahren."</div>';
    for (const v of VEHICLES) {
      const owned = state.vehicles.includes(v.id), locked = v.rank > state.rank, active = state.vehicle === v.id;
      const bar = (val, max) => `<span class="statbar"><i style="width:${Math.round(val / max * 100)}%"></i></span>`;
      h += `<div class="card ${locked ? 'locked' : ''}"><div class="ico">${v.icon}</div><div class="txt"><b>${v.name}</b>
        <small>Tempo ${bar(v.max, 540)} &nbsp; Beschl. ${bar(v.acc, 500)} &nbsp; Lenkung ${bar(v.turn, 3.7)}</small>${locked ? `<span class="tag">🔒 ab ${RANKS[v.rank].name}</span>` : ''}</div>
        <div class="act">${active ? '<span class="tag g">✔ Aktiv</span>' : owned ? `<button data-a="selveh" data-v="${v.id}">Auswählen</button>` : `<button data-a="buyveh" data-v="${v.id}" ${locked || state.money < v.price ? 'disabled' : ''}>Kaufen ${fmtMoney(v.price)}</button>`}</div></div>`;
    }
  } else if (stationTab === 'locker') {
    h += '<div class="npcline">In deinem Spind hängt ein Zettel: „Bitte keine Socken mehr im Dienstwagen lassen. – Die Kollegen"</div>';
    for (const e of EQUIP) {
      const owned = state.equipOwned.includes(e.id), on = state.equipOn.includes(e.id);
      h += `<div class="card"><div class="ico">${e.icon}</div><div class="txt"><b>${e.name}</b><small>${e.desc}</small></div>
        <div class="act">${owned ? `<button data-a="toggleeq" data-v="${e.id}" class="${on ? '' : 'ghost'}">${on ? '✔ Ausgerüstet' : 'Anlegen'}</button>` : `<button data-a="buyeq" data-v="${e.id}" ${state.money < e.price ? 'disabled' : ''}>Kaufen ${fmtMoney(e.price)}</button>`}</div></div>`;
    }
  }
  $('stBody').innerHTML = h;
}
function handleStation(a, v) {
  sfx('click');
  if (a === 'coffee') { if (state.money >= 2) { state.money -= 2; P.stamina = 100; toast('☕ Frischer Revierkaffee. Na ja, frisch...', 'good'); } }
  else if (a === 'lost') { const e = events.find(ev => P.carry === ev); if (e) e.deliverAtStation(); }
  else if (a === 'complaint') { const el = $('complaint'); if (el) el.textContent = pick(COMPLAINTS); return; }
  else if (a === 'promote') promote();
  else if (a === 'start') { const m = createMission(v); if (startMission(m)) { closeStation(); radioMsg('Andreas: Übernehme Einsatz von der Tafel!', 'a'); } return; }
  else if (a === 'buyveh') { const veh = VEHICLES.find(x => x.id === v); if (veh && state.money >= veh.price && veh.rank <= state.rank && !state.vehicles.includes(v)) { state.money -= veh.price; state.vehicles.push(v); toast(`${veh.name} gekauft!`, 'good'); sfx('coin'); } }
  else if (a === 'selveh') {
    if (P.car) { toast('Steig erst aus.', 'bad'); return; }
    state.vehicle = v; spawnPoliceCar(); toast(`${policeCar.spec.name} steht vor dem Garagentor bereit.`, 'good');
  }
  else if (a === 'buyeq') { const e = EQUIP.find(x => x.id === v); if (e && state.money >= e.price && !state.equipOwned.includes(v)) { state.money -= e.price; state.equipOwned.push(v); state.equipOn.push(v); toast(`${e.name} gekauft und angelegt!`, 'good'); sfx('coin'); } }
  else if (a === 'toggleeq') { const i = state.equipOn.indexOf(v); if (i >= 0) state.equipOn.splice(i, 1); else state.equipOn.push(v); }
  save(); renderStation();
}

function openSettings() {
  settingsOpen = true; $('settings').classList.remove('hidden');
  const s = state.settings;
  $('setBody').innerHTML = `
    <div class="setrow"><span>🔊 Sound</span><button id="setSound" class="${s.sound ? '' : 'ghost'}">${s.sound ? 'An' : 'Aus'}</button></div>
    <div class="setrow"><span>Lautstärke</span><input id="setVol" type="range" min="0" max="1" step="0.05" value="${s.volume}"></div>
    <div class="setrow"><span>💾 Speichern</span><button id="setSave" class="ghost">Jetzt speichern</button></div>
    <h3 style="margin-top:14px">🎮 Steuerung</h3>
    <div class="helpgrid"><div><kbd>WASD</kbd>/<kbd>Pfeile</kbd> Laufen &amp; Fahren</div><div><kbd>Shift</kbd> Sprinten</div><div><kbd>E</kbd> Ein-/Aussteigen</div><div><kbd>F</kbd> Interagieren / Sprechen / Kontrollieren</div><div><kbd>Leertaste</kbd> Sirene (im Auto) / „Halt, Polizei!" (zu Fuß)</div><div><kbd>R</kbd> Funkspruch annehmen</div><div><kbd>1</kbd>–<kbd>4</kbd> Dialogauswahl</div></div>
    <h3 style="margin-top:14px">💡 Tipps</h3>
    <div class="helpgrid"><div>• In der Polizeistation gibt es Einsatztafel, Büro (Beförderung), Garage, Umkleide und Empfang.</div><div>• Für eine Beförderung brauchst du XP <b>und</b> Ruf. Blechschäden kosten Ruf!</div><div>• Gelbe ❗ auf der Minimap sind Zufallsereignisse.</div></div>
    <div class="setrow" style="border:0;margin-top:12px"><span style="color:#c1121f">⚠️ Fortschritt zurücksetzen</span><button id="setReset" style="background:#c1121f">Zurücksetzen</button></div>`;
  $('setSound').onclick = () => { s.sound = !s.sound; applyVolume(); if (!s.sound) setSiren(false); save(); openSettings(); };
  $('setVol').oninput = e => { s.volume = +e.target.value; applyVolume(); };
  $('setVol').onchange = () => save();
  $('setSave').onclick = () => { save(); toast('Spielstand gespeichert.', 'good'); };
  $('setReset').onclick = e => confirmClick(e.currentTarget, 'Wirklich alles löschen?', () => { state = defaultState(); try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* */ } location.reload(); });
}
function closeSettings() { settingsOpen = false; $('settings').classList.add('hidden'); }

// ============================== RENDERING ==============================
const canvas = $('game'), ctx = canvas.getContext('2d');
const mini = $('minimap'), mctx = mini.getContext('2d');
let dpr = 1, vw = 800, vh = 600, baseZoom = 1, shake = 0;
const cam = { x: P.x, y: P.y, z: 1 };
let view = { x: 0, y: 0, w: 0, h: 0 };
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2); vw = window.innerWidth; vh = window.innerHeight;
  canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  canvas.style.width = vw + 'px'; canvas.style.height = vh + 'px';
  baseZoom = clamp(Math.min(vw, vh) / 700, 0.55, 1.15);
  const r = mini.getBoundingClientRect();
  mini.width = Math.max(60, Math.round(r.width * dpr)); mini.height = Math.max(46, Math.round(r.height * dpr));
  buildMiniBase();
}
const vis = (x, y, w, h, m = 60) => x + w > view.x - m && x < view.x + view.w + m && y + h > view.y - m && y < view.y + view.h + m;

function drawGround() {
  ctx.fillStyle = '#7bc47f'; ctx.fillRect(view.x - 10, view.y - 10, view.w + 20, view.h + 20);
  for (const b of blocks) {
    if (!vis(b.x, b.y, b.w, b.h)) continue;
    ctx.fillStyle = '#d4d0c6'; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = '#bdb8ad'; ctx.fillRect(b.x + SW - 2, b.y + SW - 2, b.w - SW * 2 + 4, b.h - SW * 2 + 4);
    ctx.fillStyle = ZONE_COLORS[b.kind]; ctx.fillRect(b.x + SW, b.y + SW, b.w - SW * 2, b.h - SW * 2);
  }
  for (const d of decals) drawDecal(d, false);
}
function drawDecal(d, top) {
  if (d.type === 'canopy') {
    if (!top || !vis(d.x, d.y, d.w, d.h)) return;
    ctx.fillStyle = 'rgba(230,57,70,.82)'; rr(ctx, d.x, d.y - 14, d.w, d.h, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.label, d.x + d.w / 2, d.y + d.h / 2 - 14); return;
  }
  if (top) return;
  if (d.type === 'pond') {
    if (!vis(d.x - d.rx, d.y - d.ry, d.rx * 2, d.ry * 2)) return;
    ctx.fillStyle = '#5e9c5a'; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.rx + 10, d.ry + 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#4ea8de'; ctx.beginPath(); ctx.ellipse(d.x, d.y, d.rx, d.ry, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
    const t = performance.now() / 1000;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(d.x + Math.sin(t + k) * 30, d.y + k * 18 - 18, 30 + k * 8, 6, 0, 0, 7); ctx.stroke(); }
    return;
  }
  if (!vis(d.x, d.y, d.w, d.h)) return;
  if (d.type === 'lot') {
    ctx.fillStyle = d.police ? '#8a93a6' : '#8d9099'; ctx.fillRect(d.x, d.y, d.w, d.h);
    if (d.lines) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; for (let x = d.x + 10; x < d.x + d.w; x += 60) { ctx.beginPath(); ctx.moveTo(x, d.y + 4); ctx.lineTo(x, d.y + 52); ctx.moveTo(x, d.y + d.h - 4); ctx.lineTo(x, d.y + d.h - 52); ctx.stroke(); } }
    if (d.police) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P O L I Z E I', d.x + d.w / 2, d.y + d.h / 2 - 10); }
  } else if (d.type === 'path') { ctx.fillStyle = '#e9d8a6'; ctx.fillRect(d.x, d.y, d.w, d.h); }
  else if (d.type === 'pool') { ctx.fillStyle = '#f1f1f1'; rr(ctx, d.x - 3, d.y - 3, d.w + 6, d.h + 6, 6); ctx.fill(); ctx.fillStyle = '#48cae4'; rr(ctx, d.x, d.y, d.w, d.h, 5); ctx.fill(); }
  else if (d.type === 'helipad') {
    ctx.fillStyle = '#5c677d'; ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w / 2, 0, 7); ctx.fill();
    ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(d.x + d.w / 2, d.y + d.h / 2, d.w / 2 - 10, 0, 7); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 60px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('H', d.x + d.w / 2, d.y + d.h / 2 + 3);
  }
}
function drawRoads() {
  const t = performance.now();
  for (const r of roads) {
    if (!vis(r.x, r.y, r.w, r.h)) continue;
    ctx.fillStyle = r.kind === 'highway' ? '#4a4e57' : '#5b5f68'; ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  // Markierungen
  ctx.lineWidth = 3; ctx.setLineDash([22, 22]);
  for (const r of roads) {
    if (!vis(r.x, r.y, r.w, r.h)) continue;
    if (r.kind === 'highway') {
      const cy = r.y + r.h / 2;
      ctx.setLineDash([]); ctx.strokeStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(view.x, cy - 3); ctx.lineTo(view.x + view.w, cy - 3); ctx.moveTo(view.x, cy + 3); ctx.lineTo(view.x + view.w, cy + 3); ctx.stroke();
      ctx.strokeStyle = '#f1f1f1'; ctx.beginPath(); ctx.moveTo(view.x, r.y + 5); ctx.lineTo(view.x + view.w, r.y + 5); ctx.moveTo(view.x, r.y + r.h - 5); ctx.lineTo(view.x + view.w, r.y + r.h - 5); ctx.stroke();
      ctx.setLineDash([22, 22]); ctx.strokeStyle = 'rgba(255,255,255,.75)';
      ctx.beginPath(); ctx.moveTo(Math.floor(view.x / 44) * 44, cy - 40); ctx.lineTo(view.x + view.w, cy - 40); ctx.moveTo(Math.floor(view.x / 44) * 44, cy + 40); ctx.lineTo(view.x + view.w, cy + 40); ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.beginPath();
      if (r.vertical) { ctx.moveTo(r.x + r.w / 2, r.y); ctx.lineTo(r.x + r.w / 2, r.y + r.h); } else { ctx.moveTo(r.x, r.y + r.h / 2); ctx.lineTo(r.x + r.w, r.y + r.h / 2); }
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);
  // Kreuzungen
  for (let j = 0; j < HY.length; j++) for (let i = 0; i < VX.length; i++) {
    const x = VX[i] - VW / 2, y = HY[j] - HW[j] / 2;
    if (!vis(x, y, VW, HW[j])) continue;
    ctx.fillStyle = j === 0 ? '#4a4e57' : '#5b5f68'; ctx.fillRect(x, y, VW, HW[j]);
    if (j > 0) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let k = 0; k < 6; k++) { ctx.fillRect(x + 8 + k * 15, y - 22, 8, 18); ctx.fillRect(x + 8 + k * 15, y + HW[j] + 4, 8, 18); }
    }
  }
  for (const r of sideRoads) {
    if (!vis(r.x, r.y, r.w, r.h)) continue;
    ctx.fillStyle = r.kind === 'alley' ? '#8a847a' : '#646870'; ctx.fillRect(r.x, r.y, r.w, r.h);
    if (r.kind === 'side') { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 2; ctx.setLineDash([14, 16]); ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h / 2); ctx.lineTo(r.x + r.w, r.y + r.h / 2); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 1; for (let k = 0; k < Math.max(r.w, r.h); k += 22) { ctx.beginPath(); if (r.w > r.h) { ctx.moveTo(r.x + k, r.y); ctx.lineTo(r.x + k, r.y + r.h); } else { ctx.moveTo(r.x, r.y + k); ctx.lineTo(r.x + r.w, r.y + k); } ctx.stroke(); } }
  }
  void t;
}
function drawStationFloor() {
  const S = STATION;
  if (!vis(S.x, S.y, S.w, S.h)) return;
  ctx.fillStyle = '#eef1f6'; ctx.fillRect(S.x, S.y, S.w, S.h);
  const rooms = [[14, 14, 186, 136, '#f3e9d2'], [210, 14, 210, 136, '#dde7f7'], [430, 14, 176, 136, '#e3f2e1'], [440, 160, 166, 226, '#d6d9de']];
  for (const [x, y, w, h, c] of rooms) { ctx.fillStyle = c; ctx.fillRect(S.x + x, S.y + y, w, h); }
  ctx.strokeStyle = 'rgba(0,0,0,.05)'; ctx.lineWidth = 1;
  for (let x = S.x; x < S.x + S.w; x += 24) { ctx.beginPath(); ctx.moveTo(x, S.y); ctx.lineTo(x, S.y + S.h); ctx.stroke(); }
  // Einsatztafel / Spinde / Schreibtisch / Garage-Auto
  ctx.fillStyle = '#2b2d42'; ctx.fillRect(S.x + 240, S.y + 16, 150, 14);
  ctx.fillStyle = '#fff'; for (let k = 0; k < 6; k++) ctx.fillRect(S.x + 246 + k * 24, S.y + 18, 16, 10);
  ctx.fillStyle = '#8d99ae'; for (let k = 0; k < 5; k++) ctx.fillRect(S.x + 446 + k * 30, S.y + 16, 26, 26);
  ctx.fillStyle = '#a47148'; ctx.fillRect(S.x + 30, S.y + 50, 90, 40);
  ctx.fillStyle = '#ffd60a'; ctx.fillRect(S.x + 470, S.y + 340, 120, 6);
  for (const p of pads) {
    const pulse = 0.5 + Math.sin(performance.now() / 300) * 0.2;
    ctx.fillStyle = `rgba(31,95,214,${0.18 + pulse * 0.2})`; ctx.beginPath(); ctx.arc(p.x, p.y, 22, 0, 7); ctx.fill();
    ctx.strokeStyle = '#1f5fd6'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#1b2a4a'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.label, p.x, p.y + 34);
  }
}
function drawStationWalls() {
  for (const w of walls) {
    if (!vis(w.x, w.y, w.w, w.h)) continue;
    if (w.desk) { ctx.fillStyle = '#7f5539'; ctx.fillRect(w.x, w.y, w.w, w.h); ctx.fillStyle = '#9c6644'; ctx.fillRect(w.x, w.y, w.w, 6); continue; }
    ctx.fillStyle = '#1b2a4a'; ctx.fillRect(w.x, w.y - 8, w.w, w.h + 8);
    ctx.fillStyle = '#2f4a80'; ctx.fillRect(w.x, w.y - 8, w.w, Math.min(w.h, 8));
  }
  const S = STATION;
  if (vis(S.x, S.y - 40, S.w, 40)) {
    ctx.fillStyle = '#1f5fd6'; rr(ctx, S.x + 200, S.y - 34, 220, 26, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★ POLIZEI ★', S.x + 310, S.y - 21);
  }
}
function drawBuilding(b) {
  const hg = b.hgt;
  if (!vis(b.x, b.y - hg, b.w, b.h + hg + 10)) return;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);
  const roof = b.roof || shade(b.color, 0.85);
  ctx.fillStyle = shade(b.color, 0.72); ctx.fillRect(b.x, b.y + b.h - hg, b.w, hg);
  if (!b.container) { ctx.fillStyle = 'rgba(180,220,255,.85)'; const n = Math.max(1, Math.floor(b.w / 34)); for (let k = 0; k < n; k++) ctx.fillRect(b.x + 8 + k * (b.w - 16) / n, b.y + b.h - hg + 6, (b.w - 16) / n - 8, Math.max(4, hg * 0.4)); }
  ctx.fillStyle = roof; ctx.fillRect(b.x, b.y - hg, b.w, b.h);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(b.x, b.y - hg, b.w, 5);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(b.x + 0.5, b.y - hg + 0.5, b.w - 1, b.h - 1);
  if (b.container) { ctx.strokeStyle = 'rgba(0,0,0,.2)'; for (let x = b.x + 6; x < b.x + b.w; x += 7) { ctx.beginPath(); ctx.moveTo(x, b.y - hg); ctx.lineTo(x, b.y - hg + b.h); ctx.stroke(); } }
  if (b.house) { ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.moveTo(b.x, b.y - hg + b.h / 2); ctx.lineTo(b.x + b.w, b.y - hg + b.h / 2); ctx.stroke(); }
  if (b.cross) { const cx = b.x + b.w / 2, cy = b.y - hg + b.h / 2; ctx.fillStyle = '#e63946'; ctx.fillRect(cx - 12, cy - 36, 24, 72); ctx.fillRect(cx - 36, cy - 12, 72, 24); }
  if (b.fire) { ctx.fillStyle = '#9d0208'; for (let k = 0; k < 3; k++) ctx.fillRect(b.x + 20 + k * (b.w - 40) / 3, b.y + b.h - hg + 4, (b.w - 40) / 3 - 14, hg - 4); }
  if (b.label) {
    ctx.fillStyle = b.cross ? '#c1121f' : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let fs = 15; ctx.font = `bold ${fs}px sans-serif`;
    while (ctx.measureText(b.label).width > b.w - 12 && fs > 8) { fs--; ctx.font = `bold ${fs}px sans-serif`; }
    const ly = b.cross ? b.y - hg + 18 : b.y - hg + b.h / 2;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.45)'; if (!b.cross) ctx.strokeText(b.label, b.x + b.w / 2, ly);
    ctx.fillText(b.label, b.x + b.w / 2, ly);
  }
}
function drawProps() {
  for (const p of props) {
    if (!vis(p.x - 60, p.y - 60, 120, 120)) continue;
    if (p.type === 'pump') { ctx.fillStyle = '#e63946'; rr(ctx, p.x, p.y, 22, 22, 4); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(p.x + 5, p.y + 4, 12, 7); }
    else if (p.type === 'bench') { ctx.fillStyle = '#7f5539'; ctx.fillRect(p.x - 20, p.y - 5, 40, 10); ctx.fillStyle = '#9c6644'; ctx.fillRect(p.x - 20, p.y - 8, 40, 4); }
    else if (p.type === 'statue') { ctx.fillStyle = '#adb5bd'; ctx.fillRect(p.x - 12, p.y - 12, 24, 24); ctx.fillStyle = '#6c757d'; ctx.beginPath(); ctx.arc(p.x, p.y - 4, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#495057'; ctx.fillRect(p.x - 6, p.y - 16, 12, 5); }
    else if (p.type === 'fountain') { ctx.fillStyle = '#ced4da'; ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, 7); ctx.fill(); ctx.fillStyle = '#4ea8de'; ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, 7); ctx.fill(); ctx.fillStyle = '#caf0f8'; ctx.beginPath(); ctx.arc(p.x, p.y, 4 + Math.sin(performance.now() / 200) * 2, 0, 7); ctx.fill(); }
    else if (p.type === 'gnome') { ctx.fillStyle = '#e63946'; ctx.beginPath(); ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x - 5, p.y); ctx.lineTo(p.x + 5, p.y); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y + 2, 4, 0, 7); ctx.fill(); }
    else if (p.type === 'flag') { ctx.fillStyle = '#6c757d'; ctx.fillRect(p.x - 2, p.y - 50, 4, 52); ctx.fillStyle = '#1f5fd6'; const w = Math.sin(performance.now() / 250) * 3; ctx.beginPath(); ctx.moveTo(p.x + 2, p.y - 50); ctx.lineTo(p.x + 34, p.y - 44 + w); ctx.lineTo(p.x + 2, p.y - 36); ctx.fill(); }
    else if (p.type === 'policesign') { ctx.fillStyle = '#1f5fd6'; rr(ctx, p.x - 40, p.y - 14, 80, 24, 5); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('Nur Polizei', p.x, p.y - 2); }
    else if (p.type === 'carts') { ctx.strokeStyle = '#adb5bd'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) ctx.strokeRect(p.x + k * 6, p.y, 14, 10); }
    else if (p.type === 'sign') { ctx.fillStyle = '#fff'; ctx.fillRect(p.x, p.y - 4, 150, 18); ctx.fillStyle = '#333'; ctx.font = '10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x + 4, p.y + 5); }
    else if (p.type === 'billboard') { ctx.fillStyle = '#495057'; ctx.fillRect(p.x - 4, p.y, 8, 40); ctx.fillStyle = '#ffd166'; rr(ctx, p.x - 150, p.y - 34, 300, 44, 6); ctx.fill(); ctx.fillStyle = '#1b2a4a'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x, p.y - 12); }
  }
}
function drawCar(c) {
  if (!vis(c.x - 50, c.y - 50, 100, 100)) return;
  const fade = c.removeT != null ? clamp(c.removeT / 2, 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(c.x, c.y); ctx.rotate(c.a);
  const l = c.l, w = c.w;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; rr(ctx, -l / 2 + 3, -w / 2 + 4, l, w, 7); ctx.fill();
  if (c.bike) {
    ctx.fillStyle = '#222'; rr(ctx, -l / 2, -3, l, 6, 3); ctx.fill();
    ctx.fillStyle = c.color; rr(ctx, -l / 2 + 6, -w / 2, l - 14, w, 5); ctx.fill();
    ctx.fillStyle = c.stripe || '#1f5fd6'; ctx.fillRect(-4, -w / 2, 8, w);
    ctx.fillStyle = '#1b2a4a'; ctx.beginPath(); ctx.arc(-4, 0, 6, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = c.color; rr(ctx, -l / 2, -w / 2, l, w, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.stroke();
    if (c.police || c.stripe) { ctx.fillStyle = c.stripe || '#1f5fd6'; ctx.fillRect(-l / 2 + 4, -w / 2, l - 8, 4); ctx.fillRect(-l / 2 + 4, w / 2 - 4, l - 8, 4); }
    if (c.ambulance) { ctx.fillStyle = '#e63946'; ctx.fillRect(-4, -w / 2 + 3, 8, w - 6); ctx.fillRect(-10, -3, 20, 6); }
    if (c.firetruck) { ctx.fillStyle = '#adb5bd'; ctx.fillRect(-l / 2 + 6, -4, l - 22, 8); }
    if (c.truck) { ctx.fillStyle = shade(c.color, 0.8); rr(ctx, l / 2 - 20, -w / 2 + 1, 18, w - 2, 4); ctx.fill(); ctx.fillStyle = '#2b3a4a'; ctx.fillRect(l / 2 - 8, -w / 2 + 4, 5, w - 8); }
    else {
      ctx.fillStyle = '#2b3a4a'; rr(ctx, l * 0.1, -w / 2 + 3, l * 0.16, w - 6, 3); ctx.fill();
      rr(ctx, -l * 0.36, -w / 2 + 3, l * 0.12, w - 6, 3); ctx.fill();
      ctx.fillStyle = shade(c.color === '#f4f6fb' ? '#dfe5f0' : c.color, 1.1); rr(ctx, -l * 0.22, -w / 2 + 4, l * 0.3, w - 8, 3); ctx.fill();
    }
    ctx.fillStyle = '#fff3b0'; ctx.fillRect(l / 2 - 3, -w / 2 + 3, 3, 5); ctx.fillRect(l / 2 - 3, w / 2 - 8, 3, 5);
    ctx.fillStyle = '#c1121f'; ctx.fillRect(-l / 2, -w / 2 + 3, 2, 5); ctx.fillRect(-l / 2, w / 2 - 8, 2, 5);
  }
  if (c.police && !c.parked || (c.parked && c.police)) {
    const on = c.siren, ph = Math.floor(performance.now() / 160) % 2;
    const lx = c.bike ? -l / 2 + 4 : -4;
    ctx.fillStyle = on ? (ph ? '#ff2d2d' : '#3a7bff') : '#8aa2d6'; ctx.fillRect(lx, -w / 2 + 4, 7, w / 2 - 4);
    ctx.fillStyle = on ? (ph ? '#3a7bff' : '#ff2d2d') : '#8aa2d6'; ctx.fillRect(lx, 0, 7, w / 2 - 4);
    if (on) { ctx.globalAlpha = 0.25 * fade; ctx.fillStyle = ph ? '#ff2d2d' : '#3a7bff'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, 7); ctx.fill(); }
  }
  if (c.speeder) { ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-l / 2 - 6 - k * 8, -6 + k * 6); ctx.lineTo(-l / 2 - 20 - k * 8, -6 + k * 6); ctx.stroke(); } }
  if (c.state === 'wreck') { ctx.fillStyle = 'rgba(120,120,120,.5)'; const t = performance.now() / 400; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(l / 2 - 6 + Math.sin(t + k) * 4, -k * 7, 6 + k * 2, 0, 7); ctx.fill(); } }
  ctx.restore();
}
function drawPerson(p, cop) {
  if (!vis(p.x - 30, p.y - 30, 60, 60)) return;
  const fade = p.removeT != null ? clamp(p.removeT / 2, 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(2, 4, 10, 7, 0, 0, 7); ctx.fill();
  ctx.rotate(p.a);
  const sw = p.moving ? Math.sin(p.step) * 5 : 0;
  ctx.fillStyle = cop ? '#13213d' : '#3d405b';
  ctx.beginPath(); ctx.arc(sw, -4, 3.5, 0, 7); ctx.arc(-sw, 4, 3.5, 0, 7); ctx.fill();
  ctx.fillStyle = cop ? '#1f5fd6' : p.shirt; ctx.beginPath(); ctx.ellipse(0, 0, 6, 9.5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = cop ? '#1f5fd6' : p.shirt; ctx.beginPath(); ctx.arc(2, -8.5, 3, 0, 7); ctx.arc(2, 8.5, 3, 0, 7); ctx.fill();
  ctx.fillStyle = p.skin || '#f1c27d'; ctx.beginPath(); ctx.arc(1, 0, 5.5, 0, 7); ctx.fill();
  if (cop) {
    ctx.fillStyle = '#13213d'; ctx.beginPath(); ctx.arc(0, 0, 5.8, Math.PI * 0.5, Math.PI * 1.5); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#0d1630'; ctx.fillRect(3, -4, 4, 8);
    ctx.fillStyle = '#ffd60a'; ctx.beginPath(); ctx.arc(-1, 0, 1.6, 0, 7); ctx.fill();
  } else { ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(-0.5, 0, 5, Math.PI * 0.55, Math.PI * 1.45); ctx.fill(); }
  ctx.restore();
}
function drawAnimal(a) {
  if (!vis(a.x - 20, a.y - 20, 40, 40)) return;
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.a || 0);
  if (a.type === 'dog') { ctx.fillStyle = '#a0522d'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(9, 0, 4.5, 0, 7); ctx.fill(); ctx.fillStyle = '#5c3317'; ctx.beginPath(); ctx.arc(9, -4, 2, 0, 7); ctx.arc(9, 4, 2, 0, 7); ctx.fill(); ctx.strokeStyle = '#a0522d'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-14, Math.sin(performance.now() / 80) * 4); ctx.stroke(); }
  else if (a.type === 'duck') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 7, 4.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2d6a4f'; ctx.beginPath(); ctx.arc(6, 0, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#f4a261'; ctx.fillRect(8, -1, 3, 2); }
  else if (a.type === 'pigeon') { const fl = a.fly > 0; ctx.fillStyle = '#8d99ae'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3.5, 0, 0, 7); ctx.fill(); if (fl) { ctx.fillStyle = '#adb5bd'; const f = Math.sin(performance.now() / 50) * 5; ctx.beginPath(); ctx.ellipse(0, -4, 3, 5 + f, 0, 0, 7); ctx.ellipse(0, 4, 3, 5 - f, 0, 0, 7); ctx.fill(); } ctx.fillStyle = '#495057'; ctx.beginPath(); ctx.arc(4, 0, 2.2, 0, 7); ctx.fill(); }
  ctx.restore();
}
function drawTrees() {
  for (const t of trees) {
    if (!vis(t.x - t.r, t.y - t.r * 2, t.r * 2, t.r * 3)) continue;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.arc(t.x + 5, t.y + 5, t.r, 0, 7); ctx.fill();
    ctx.fillStyle = '#6b4226'; ctx.fillRect(t.x - 3, t.y - 4, 6, 8);
    ctx.fillStyle = t.c; ctx.beginPath(); ctx.arc(t.x, t.y - t.r * 0.5, t.r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(t.x - t.r * 0.3, t.y - t.r * 0.8, t.r * 0.45, 0, 7); ctx.fill();
  }
}
function toScreen(x, y) { return { x: (x - cam.x) * cam.z + vw / 2, y: (y - cam.y) * cam.z + vh / 2 }; }
function drawBubble(text, x, y, color) {
  const s = toScreen(x, y);
  if (s.x < -200 || s.x > vw + 200 || s.y < -60 || s.y > vh + 60) return;
  ctx.font = 'bold 12px system-ui, sans-serif';
  const w = Math.min(220, ctx.measureText(text).width + 14), h = 22;
  const bx = clamp(s.x - w / 2, 4, vw - w - 4), by = s.y - 34 * Math.max(0.7, cam.z) - h;
  ctx.fillStyle = color || 'rgba(255,255,255,.96)'; rr(ctx, bx, by, w, h, 8); ctx.fill();
  ctx.beginPath(); ctx.moveTo(s.x - 5, by + h); ctx.lineTo(s.x + 5, by + h); ctx.lineTo(s.x, by + h + 6); ctx.fill();
  ctx.fillStyle = '#1d2433'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let t = text; while (ctx.measureText(t).width > w - 12 && t.length > 4) t = t.slice(0, -2);
  ctx.fillText(t === text ? t : t + '…', bx + w / 2, by + h / 2 + 0.5);
}
function drawMarker(x, y, color, label, icon) {
  const s = toScreen(x, y), t = performance.now() / 1000, m = 36;
  if (s.x > m && s.x < vw - m && s.y > m + 30 && s.y < vh - m) {
    const by = s.y - 48 * Math.max(0.7, cam.z) + Math.sin(t * 5) * 5;
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(s.x, by + 14); ctx.lineTo(s.x - 11, by); ctx.lineTo(s.x + 11, by); ctx.fill();
    if (icon) { ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, s.x, by - 12); }
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
    ctx.beginPath(); ctx.arc(s.x, s.y, 20 * cam.z + Math.sin(t * 6) * 3, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
  } else {
    const ang = Math.atan2(s.y - vh / 2, s.x - vw / 2);
    const ex = clamp(vw / 2 + Math.cos(ang) * vw, m, vw - m), ey = clamp(vh / 2 + Math.sin(ang) * vh, m + 20, vh - m);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-10, -12); ctx.lineTo(-4, 0); ctx.lineTo(-10, 12); ctx.fill();
    ctx.restore();
    const d = Math.round(Math.hypot(x - P.x, y - P.y) / 10);
    ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(20,32,58,.85)'; rr(ctx, ex - 26, ey + 16, 52, 18, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(d + ' m', ex, ey + 25);
  }
  void label;
}
function render() {
  const z = cam.z, sx = shake ? rand(-shake, shake) : 0, sy = shake ? rand(-shake, shake) : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#5e9c5a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * (vw / 2 - cam.x * z + sx), dpr * (vh / 2 - cam.y * z + sy));
  view = { x: cam.x - vw / 2 / z, y: cam.y - vh / 2 / z, w: vw / z, h: vh / z };
  drawGround(); drawRoads(); drawStationFloor(); drawProps();
  for (const c of parked) drawCar(c);
  for (const e of events) if (e.wallet && e.phase === 0) { ctx.fillStyle = '#7f5539'; rr(ctx, e.wallet.x - 6, e.wallet.y - 4, 12, 8, 2); ctx.fill(); ctx.fillStyle = 'rgba(255,214,10,' + (0.4 + Math.sin(performance.now() / 150) * 0.3) + ')'; ctx.beginPath(); ctx.arc(e.wallet.x, e.wallet.y, 11, 0, 7); ctx.fill(); }
  for (const a of animals) drawAnimal(a);
  for (const c of cars) drawCar(c);
  for (const p of peds) drawPerson(p, p.cop);
  if (!P.car) drawPerson({ x: P.x, y: P.y, a: P.a, moving: P.moving, step: P.step, skin: '#f1c27d' }, true);
  const sorted = buildings.filter(b => vis(b.x, b.y - b.hgt, b.w, b.h + b.hgt)).sort((a, b) => (a.y + a.h) - (b.y + b.h));
  for (const b of sorted) drawBuilding(b);
  drawStationWalls();
  for (const d of decals) if (d.type === 'canopy') drawDecal(d, true);
  drawTrees();
  // Bildschirm-Ebene
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (const p of peds) if (p.bubbleT > 0 && p.bubble && dist(p, P) < 900) drawBubble(p.bubble, p.x, p.y);
  for (const c of cars) if (c.bubbleT > 0 && c.bubble && dist(c, P) < 900) drawBubble(c.bubble, c.x, c.y);
  if (P.bubbleT > 0) drawBubble(P.bubble, P.x, P.y, '#d0e1ff');
  if (mission && mission.target) { const t = mission.target(); if (t) drawMarker(t.x, t.y, '#ffb703', '', MISSION_TYPES[mission.type]?.icon || '📞'); }
  for (const e of events) drawMarker(e.x, e.y, '#ffd60a', '', e.icon);
  if (policeCar && !P.car && dist(P, policeCar) > 250) drawMarker(policeCar.x, policeCar.y, '#3a86ff', '', '🚓');
  for (const f of floaters) { const s = toScreen(f.x, f.y); ctx.globalAlpha = clamp(f.t, 0, 1); ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.strokeText(f.text, s.x, s.y); ctx.fillStyle = f.color; ctx.fillText(f.text, s.x, s.y); ctx.globalAlpha = 1; }
  drawMinimap();
}

// ---------- Minimap ----------
let miniBase = null;
function buildMiniBase() {
  miniBase = document.createElement('canvas'); miniBase.width = mini.width; miniBase.height = mini.height;
  const m = miniBase.getContext('2d'), sx = mini.width / W, sy = mini.height / H;
  m.fillStyle = '#7bc47f'; m.fillRect(0, 0, mini.width, mini.height);
  for (const b of blocks) { m.fillStyle = ZONE_COLORS[b.kind]; m.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy); }
  m.fillStyle = 'rgba(0,0,0,.25)'; for (const b of buildings) m.fillRect(b.x * sx, b.y * sy, Math.max(1, b.w * sx), Math.max(1, b.h * sy));
  if (PARK) { m.fillStyle = '#4ea8de'; m.beginPath(); m.ellipse(PARK.pcx * sx, PARK.pcy * sy, PARK.rx * sx, PARK.ry * sy, 0, 0, 7); m.fill(); }
  m.fillStyle = '#5b5f68'; for (const r of roads) m.fillRect(r.x * sx, r.y * sy, Math.max(1.5, r.w * sx), Math.max(1.5, r.h * sy));
  m.fillStyle = '#7d7f86'; for (const r of sideRoads) m.fillRect(r.x * sx, r.y * sy, Math.max(1, r.w * sx), Math.max(1, r.h * sy));
  m.fillStyle = '#1f5fd6'; m.fillRect(STATION.x * sx, STATION.y * sy, STATION.w * sx, STATION.h * sy);
  const fs = Math.max(8, Math.round(mini.width / 18));
  m.font = `${fs}px sans-serif`; m.textAlign = 'center'; m.textBaseline = 'middle';
  for (const id of ['hospital', 'fire', 'gas', 'supermarket', 'park', 'donut', 'bank']) { const p = pois[id]; if (p) m.fillText(p.icon, p.x * sx, (p.y - 60) * sy); }
  m.fillText('👮', (STATION.x + STATION.w / 2) * sx, (STATION.y + STATION.h / 2) * sy);
}
function drawMinimap() {
  if (!miniBase) return;
  const sx = mini.width / W, sy = mini.height / H, s = mini.width / 200;
  mctx.drawImage(miniBase, 0, 0);
  const dot = (x, y, r, c, stroke) => { mctx.fillStyle = c; mctx.beginPath(); mctx.arc(x * sx, y * sy, r * s, 0, 7); mctx.fill(); if (stroke) { mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.5 * s; mctx.stroke(); } };
  for (const e of events) dot(e.x, e.y, 3.5, '#ffd60a', true);
  if (mission && mission.target) { const t = mission.target(); if (t) { const pulse = 4 + Math.sin(performance.now() / 150) * 1.5; dot(t.x, t.y, pulse, '#ff8800', true); } }
  if (policeCar && P.car !== policeCar) dot(policeCar.x, policeCar.y, 3.5, '#3a86ff', true);
  const pp = playerPos();
  mctx.save(); mctx.translate(pp.x * sx, pp.y * sy); mctx.rotate(P.car ? P.car.a : P.a);
  mctx.fillStyle = '#e63946'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 1.5 * s;
  mctx.beginPath(); mctx.moveTo(6 * s, 0); mctx.lineTo(-4 * s, -4 * s); mctx.lineTo(-4 * s, 4 * s); mctx.closePath(); mctx.fill(); mctx.stroke();
  mctx.restore();
}

// ============================== HUD ==============================
const hudCache = {};
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function updateHUD() {
  const nextR = RANKS[state.rank + 1];
  setText('hudRank', RANKS[state.rank].name);
  setText('hudXp', nextR ? `${state.xp} / ${nextR.xp}` : `${state.xp} (MAX)`);
  const pr = nextR ? clamp((state.xp - RANKS[state.rank].xp) / (nextR.xp - RANKS[state.rank].xp), 0, 1) : 1;
  const prs = (pr * 100).toFixed(1) + '%'; if (hudCache.xpb !== prs) { hudCache.xpb = prs; $('hudXpBar').style.width = prs; }
  setText('hudMoney', fmtMoney(state.money));
  setText('hudRep', String(state.rep) + (canPromote() ? '  ⭐' : ''));
  $('hudStamina').style.width = P.stamina + '%';
  // Mission
  if (mission) {
    $('mission').classList.remove('hidden');
    setText('missionTitle', (MISSION_TYPES[mission.type]?.icon || '📞') + ' ' + mission.title);
    setText('missionGoal', mission.goal);
    const pg = mission.progress;
    if (pg != null) { $('missionProgress').classList.remove('hidden'); $('missionProgress').firstElementChild.style.width = (pg * 100) + '%'; }
    else $('missionProgress').classList.add('hidden');
  } else $('mission').classList.add('hidden');
  // Hinweis
  let hint = '';
  if (started && !dlg && !stationOpen && !settingsOpen) {
    if (P.car) { if (Math.abs(P.car.v) < 90) hint = '<kbd>E</kbd>Aussteigen'; }
    else {
      const h = findInteraction();
      if (h) hint = `<kbd>F</kbd>${esc(h.label)}`;
      else if (policeCar && dist(P, policeCar) < 75) hint = '<kbd>E</kbd>Einsteigen';
    }
  }
  if (hudCache.hint !== hint) { hudCache.hint = hint; $('hint').innerHTML = hint; $('hint').classList.toggle('hidden', !hint); }
  if (P.car) { $('speedo').classList.remove('hidden'); setText('speedo', Math.round(Math.abs(P.car.v) / 5) + ' km/h'); } else $('speedo').classList.add('hidden');
  const lab = P.car ? 'Aussteigen' : 'Einsteigen';
  setText('tEnterLabel', lab);
  $('tSiren').classList.toggle('on', !!(policeCar && policeCar.siren));
}

// ============================== HAUPTSCHLEIFE ==============================
let started = false, saveT = 0;
const paused = () => !!dlg || stationOpen || settingsOpen;
function update(dt) {
  state.stats.playtime += dt;
  crashCd -= dt; dodgeCd -= dt; P.shoutCd -= dt;
  if (P.bubbleT > 0) P.bubbleT -= dt;
  if (stationParkerCd > 0) { stationParkerCd -= dt; if (stationParkerCd <= 0 && !stationParker) { if (!hitSolid(1760, 1585, 20) && dist(P, { x: 1760, y: 1585 }) > 150) stationParker = addParked(1760, 1585, 0, pick(CAR_COLORS)); else stationParkerCd = 10; } }
  updatePlayer(dt);
  for (let i = cars.length - 1; i >= 0; i--) {
    const c = cars[i];
    if (c.removeT != null) { c.removeT -= dt; if (c.removeT <= 0) { cars.splice(i, 1); continue; } }
    if (c.ai) updateAICar(c, dt);
  }
  for (let i = peds.length - 1; i >= 0; i--) {
    const p = peds[i];
    if (p.removeT != null) { p.removeT -= dt; if (p.removeT <= 0) { peds.splice(i, 1); continue; } }
    updatePed(p, dt);
  }
  updateAnimals(dt);
  if (mission) { mission.time += dt; if (mission.update) mission.update(dt); }
  updateEvents(dt); updateRadio(dt); updateChatter(dt);
  for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.t -= dt; f.y -= 30 * dt; if (f.t <= 0) floaters.splice(i, 1); }
  // Kamera
  const tgt = playerPos();
  let lx = 0, ly = 0, zoom = baseZoom;
  if (P.car) { lx = Math.cos(P.car.a) * P.car.v * 0.35; ly = Math.sin(P.car.a) * P.car.v * 0.35; zoom = baseZoom * (1 - clamp(Math.abs(P.car.v) / 700, 0, 1) * 0.2); }
  cam.x = lerp(cam.x, tgt.x + lx, clamp(dt * 5, 0, 1)); cam.y = lerp(cam.y, tgt.y + ly, clamp(dt * 5, 0, 1));
  cam.z = lerp(cam.z, zoom, clamp(dt * 2, 0, 1));
  shake = Math.max(0, shake - dt * 30);
  updateSirenAudio(dt);
  saveT += dt; if (saveT > 15) { saveT = 0; save(); }
}
let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
  if (started && !paused()) update(dt);
  else { cam.z = lerp(cam.z, baseZoom, 0.1); if (!started) { cam.x += Math.sin(t / 4000) * 0.4; } }
  render(); updateHUD();
  requestAnimationFrame(frame);
}

// ============================== INPUT ==============================
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  keys[k] = true;
  if (e.repeat) return;
  if (!started) { if (k === 'enter' || k === ' ') startGame(); return; }
  if (dlg) {
    if (/^[1-4]$/.test(k)) dialogChoose(+k - 1);
    else if ((k === 'enter' || k === 'f' || k === ' ') && !dlg.steps[dlg.i].choices) dialogChoose(0);
    return;
  }
  if (stationOpen) { if (k === 'escape' || k === 'f') closeStation(); return; }
  if (settingsOpen) { if (k === 'escape') closeSettings(); return; }
  if (k === 'e') actEnter();
  else if (k === 'f') actInteract();
  else if (k === ' ') actSiren();
  else if (k === 'r') acceptOffer();
  else if (k === 'escape') openSettings();
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; touchSprint = false; });

function enableTouch() { if (document.body.classList.contains('touchmode')) return; document.body.classList.add('touchmode'); $('touch').classList.remove('hidden'); setTimeout(resize, 50); }
if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) enableTouch();
window.addEventListener('touchstart', enableTouch, { passive: true });

const joyZone = $('joyZone'), joyBase = $('joyBase'), joyKnob = $('joyKnob');
const JR = 55;
joyZone.addEventListener('pointerdown', e => {
  e.preventDefault(); joy.active = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
  const r = joyZone.getBoundingClientRect();
  joyBase.style.left = (e.clientX - r.left - 60) + 'px'; joyBase.style.top = (e.clientY - r.top - 60) + 'px'; joyBase.style.bottom = 'auto';
  try { joyZone.setPointerCapture(e.pointerId); } catch (err) { /* */ }
  initAudio();
});
joyZone.addEventListener('pointermove', e => {
  if (!joy.active || e.pointerId !== joy.id) return;
  let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const len = Math.hypot(dx, dy);
  if (len > JR) { dx = dx / len * JR; dy = dy / len * JR; }
  joy.x = dx / JR; joy.y = dy / JR; joy.mag = Math.min(1, len / JR);
  joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
});
const joyEnd = e => {
  if (e.pointerId !== joy.id) return;
  joy.active = false; joy.x = joy.y = joy.mag = 0; joy.id = null;
  joyKnob.style.transform = ''; joyBase.style.left = '40px'; joyBase.style.top = 'auto'; joyBase.style.bottom = '40px';
};
joyZone.addEventListener('pointerup', joyEnd); joyZone.addEventListener('pointercancel', joyEnd);

document.querySelectorAll('#touchBtns button').forEach(b => {
  const act = b.dataset.act;
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); initAudio();
    if (!started || paused()) { if (dlg && act === 'interact' && !dlg.steps[dlg.i].choices) dialogChoose(0); return; }
    if (act === 'sprint') touchSprint = true;
    else if (act === 'siren') actSiren();
    else if (act === 'enter') actEnter();
    else if (act === 'interact') actInteract();
  });
  const up = () => { if (act === 'sprint') touchSprint = false; };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
});

$('radioAccept').onclick = () => { initAudio(); acceptOffer(); };
$('radioDecline').onclick = () => declineOffer();
function confirmClick(btn, label, fn) {
  if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.orig; fn(); return; }
  btn.dataset.orig = btn.textContent; btn.dataset.armed = '1'; btn.textContent = label;
  setTimeout(() => { if (btn.dataset.armed === '1') { btn.dataset.armed = ''; btn.textContent = btn.dataset.orig; } }, 3000);
}
$('missionCancel').onclick = e => { if (mission) confirmClick(e.currentTarget, 'Sicher? (−2 Ruf)', () => failMission('abgebrochen')); };
$('btnMenu').onclick = () => { if (started) openSettings(); };
$('stClose').onclick = closeStation;
$('setClose').onclick = closeSettings;
$('stTabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { stationTab = b.dataset.tab; renderStation(); sfx('click'); } });
$('stBody').addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && !b.disabled) handleStation(b.dataset.a, b.dataset.v); });
$('btnStart').onclick = startGame;
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));
document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); if (actx) actx.suspend(); } else if (actx && started) actx.resume(); });
window.addEventListener('pagehide', save);
document.addEventListener('gesturestart', e => e.preventDefault());

function startGame() {
  if (started) return;
  started = true; initAudio();
  $('start').classList.add('hidden');
  if (!state.tutorialDone) {
    state.tutorialDone = true;
    setTimeout(() => radioMsg('Zentrale an Andreas: Willkommen im Dienst! Dein Streifenwagen steht vor dem Garagentor (Ostseite des Reviers).'), 600);
    setTimeout(() => dialog([{ who: 'Hauptkommissar Brösel', face: '👨‍✈️', text: 'Neunkirch! Willkommen in Neunkirchhausen. Ihre erste Schicht als Polizeianwärter.' }, { who: 'Hauptkommissar Brösel', face: '👨‍✈️', text: 'Ihr Streifenwagen steht draußen vor der Garage. Achten Sie auf den Polizeifunk oben rechts – oder holen Sie sich einen Einsatz an der Einsatztafel.' }, { who: 'Hauptkommissar Brösel', face: '👨‍✈️', text: 'Und Neunkirch: Herr Dreist parkt schon wieder vor der Tür. Viel Erfolg.' }, ME('Verstanden, Chef!')]), 900);
    radio.t = 20;
  } else {
    setTimeout(() => radioMsg(`Zentrale an Andreas: Schön, dass du wieder da bist, ${RANKS[state.rank].name}!`), 600);
    radio.t = 15;
  }
  checkPromotion(); save();
}

// ============================== INIT ==============================
initTraffic(); spawnPoliceCar(); initPeds(); initAnimals(); setupInteractables();
radioMsg('Zentrale: Funkverbindung steht. Guten Dienst!');
$('startSave').textContent = loaded.had ? `💾 Spielstand gefunden: ${RANKS[state.rank].name}, ${state.xp} XP, ${fmtMoney(state.money)}` : 'Neuer Dienstantritt – viel Erfolg!';
if (loaded.had) $('btnStart').textContent = 'Dienst fortsetzen';
resize();
cam.x = P.x; cam.y = P.y; cam.z = baseZoom;
requestAnimationFrame(frame);

// Debug-/Test-Zugriff (nützlich für Entwicklung)
window.__game = { get state() { return state; }, P, cars, peds, get mission() { return mission; }, startMission, createMission, events, spawnEvent, acceptOffer, makeOffer, get radioOffer() { return radio.offer; }, openStation, actEnter, actInteract, actSiren, findInteraction, keys, update, dialogChoose, get dlg() { return dlg; }, get policeCar() { return policeCar; }, promote, nodes, pois, hitSolid };
})();
